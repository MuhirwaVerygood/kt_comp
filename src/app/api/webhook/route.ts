import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paypackService } from '@/services/paypack.service';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paypack-signature");
    const rawBodyText = await request.text();
    const rawBody = Buffer.from(rawBodyText, 'utf8');

    // SECURITY: Always verify the signature
    if (!paypackService.verifyWebhookSignature(signature || undefined, rawBody)) {
      console.warn("Invalid webhook signature received.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const { data } = JSON.parse(rawBodyText);
    console.log("Webhook received:", data);

    const payment = await prisma.payment.findFirst({
      where: { paypackRef: data.ref },
    });
    
    if (!payment) {
      console.warn(`Payment with ref ${data.ref} not found.`);
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    const newStatus = data.status === "successful" ? "SUCCESSFUL" : "FAILED";
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });
    console.log(`Payment ${payment.id} updated to ${newStatus}`);

    // Update order status if payment is linked to an order
    if (payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: newStatus === "SUCCESSFUL" ? "CONFIRMED" : "CANCELLED",
          paymentStatus: newStatus === "SUCCESSFUL" ? "PAID" : "FAILED"
        },
      });
      console.log(`Order ${payment.orderId} updated to ${newStatus === "SUCCESSFUL" ? "CONFIRMED" : "CANCELLED"}`);
    }

    // REAL-TIME UPDATE: Notify the frontend via WebSocket
    // Since we're using a separate socket server, we need to make an HTTP request to it
    try {
      const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
      const response = await fetch(`${socketServerUrl}/emit-payment-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment.id,
          status: newStatus
        }),
      });

      if (response.ok) {
        console.log(`✅ Emitted WebSocket update for payment ${payment.id} with status ${newStatus}`);
      } else {
        console.warn(`❌ Failed to emit WebSocket update: ${response.status}`);
      }
    } catch (error) {
      console.warn("❌ Error emitting WebSocket update:", error);
    }

    return NextResponse.json({ message: "Webhook processed." }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing webhook:", error.message);
    return NextResponse.json(
      { error: "Error processing webhook." },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  return NextResponse.json({ status: 'ok' });
}