// Client-side socket utilities for connecting to the separate socket server
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Force the correct URL for now
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log('🔌 Connecting to socket server:', socketUrl);
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      secure: socketUrl.startsWith('https')
    });
    
    socket.on('connect', () => {
      console.log('🔌 Socket connected successfully:', socket?.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Helper function to register for payment updates
export function registerForPaymentUpdates(orderId: string) {
  const socket = getSocket();
  socket.emit("registerPayment", orderId);
  console.log(`📤 Registered for payment updates for order: ${orderId}`);

  // Listen for registration confirmation
  socket.once("registered", (data: { paymentId: string }) => {
    console.log(`✅ Registration confirmed for payment: ${data.paymentId}`);
  });
}

// Helper function to listen for payment updates
export function onPaymentUpdate(callback: (data: { status: "SUCCESSFUL" | "FAILED" }) => void) {
  const socket = getSocket();
  socket.on("payment:update", callback);
}

// Helper function to remove payment update listener
export function offPaymentUpdate(callback?: (data: { status: "SUCCESSFUL" | "FAILED" }) => void) {
  const socket = getSocket();
  if (callback) {
    socket.off("payment:update", callback);
  } else {
    socket.off("payment:update");
  }
}