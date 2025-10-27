"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { getSocket, registerForPaymentUpdates, onPaymentUpdate, offPaymentUpdate } from "@/lib/socket";

interface PaymentStatusCheckerProps {
  orderId: string;
  onStatusChange: (status: "PENDING" | "PAID" | "FAILED") => void;
}

export default function PaymentStatusChecker({ orderId, onStatusChange }: PaymentStatusCheckerProps) {
  const [status, setStatus] = useState<"PENDING" | "PAID" | "FAILED">("PENDING");
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Get socket instance and register for updates
    const socket = getSocket();

    // Register for payment updates
    socket.on("connect", () => {
      console.log("🔌 Connected to socket server:", socket.id);
      registerForPaymentUpdates(orderId);
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
    });

    // Listen for payment updates
    const handlePaymentUpdate = (data: { status: "SUCCESSFUL" | "FAILED" }) => {
      console.log("💳 Real-time payment update:", data);
      const newStatus = data.status === "SUCCESSFUL" ? "PAID" : "FAILED";
      setStatus(newStatus);
      onStatusChange(newStatus);
    };

    onPaymentUpdate(handlePaymentUpdate);

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from socket server");
    });

    // Fallback polling (in case socket fails)
    let timer: NodeJS.Timeout;
    let statusChecker: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const data = await response.json();
          const order = data.data || data.order;
          const newStatus = order.paymentStatus;

          console.log('💳 Payment Status Check (fallback):', {
            orderId,
            currentStatus: newStatus,
            timeElapsed: `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`
          });

          if (newStatus !== status) {
            setStatus(newStatus);
            onStatusChange(newStatus);

            if (newStatus === "PAID" || newStatus === "FAILED") {
              clearInterval(timer);
              clearInterval(statusChecker);
            }
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Start timers
    timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    statusChecker = setInterval(checkStatus, 5000); // Less frequent polling since we have sockets

    // Initial check
    checkStatus();

    return () => {
      clearInterval(timer);
      clearInterval(statusChecker);
      offPaymentUpdate(handlePaymentUpdate);
      // Don't disconnect socket here as it might be used by other components
    };
  }, [orderId, status, timeElapsed, onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-8 w-8 text-blue-600 animate-pulse" />;
      case "PAID":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "FAILED":
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "PENDING":
        return "Waiting for Paypack confirmation...";
      case "PAID":
        return "Payment confirmed by Paypack!";
      case "FAILED":
        return "Payment failed or was cancelled";
      default:
        return "Checking payment status...";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {getStatusIcon()}
      <div className="text-center">
        <p className="font-medium text-gray-900">{getStatusMessage()}</p>
        <p className="text-sm text-gray-500 mt-1">
          Time elapsed: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </p>
        {status === "PENDING" && (
          <p className="text-xs text-blue-600 mt-2">
            ⚡ Real-time status checking via WebSocket + fallback polling every 5 seconds
          </p>
        )}
      </div>
    </div>
  );
}