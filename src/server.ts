import { createServer } from "node:http";
import { Server } from "socket.io";

import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { authenticateSocket } from "./features/connections/connection.auth.js";
import { registerConnectionSockets } from "./features/connections/connection.socket.js";
const PORT = Number(process.env.PORT) || 5000;
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? [],
    methods: ["GET", "POST"],
  },
});

io.use(authenticateSocket);
registerConnectionSockets(io);
io.on("connection", (socket) => {
  const userId = socket.data.userId as string;

  console.log(`Authenticated socket connected: ${userId}`);

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${userId}, reason: ${reason}`);
  });
});

async function bootstrap(): Promise<void> {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Riffly API running on port ${PORT}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
