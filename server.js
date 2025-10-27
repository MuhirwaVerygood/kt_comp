const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  console.log('Initializing Socket.IO...');
  try {
    // Direct inline Socket.IO setup
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST"]
      }
    });

    // Store socket connections by payment ID
    const paymentSockets = new Map();

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("registerPayment", (paymentId) => {
        console.log(`Registering socket ${socket.id} for payment ${paymentId}`);
        paymentSockets.set(paymentId, socket.id);
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Clean up payment registrations
        for (const [paymentId, socketId] of paymentSockets.entries()) {
          if (socketId === socket.id) {
            paymentSockets.delete(paymentId);
            break;
          }
        }
      });
    });

    // Make emitPaymentUpdate available globally
    global.emitPaymentUpdate = (paymentId, status) => {
      const socketId = paymentSockets.get(paymentId);
      if (socketId) {
        io.to(socketId).emit("payment:update", { status });
        console.log(`Sent WebSocket update for payment ${paymentId} to socket ${socketId}`);
        paymentSockets.delete(paymentId); // Clean up after sending
      } else {
        console.warn(`No socket found for payment ${paymentId}. Available sockets:`, Array.from(paymentSockets.keys()));
      }
    };

    console.log('Socket.IO initialized successfully');
  } catch (error) {
    console.warn('Socket.IO initialization failed, continuing without real-time features:', error.message);
  }

  const port = process.env.PORT || 3000;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});