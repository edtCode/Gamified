import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import crypto from "crypto";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { canMessage } from "../services/mentors";
import { notify } from "../services/notifications";
import { setIo, userRoom, emitToUser } from "./registry";
import { redis, redisReady } from "../lib/redis";
import { isAllowedOrigin } from "../app";

interface AuthedSocket extends Socket {
  userId?: string;
}

// Wire up Socket.IO on the shared HTTP server. Clients authenticate by passing
// their JWT in the handshake `auth.token`. Each socket joins a per-user room so
// services can push events (see registry.emitToUser).
export function initSockets(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    // Mirror the REST CORS policy: allow the configured origin plus any
    // localhost/127.0.0.1 origin, so the live room updates connect whether the
    // app is opened via localhost or 127.0.0.1.
    cors: {
      origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) return callback(null, true);
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    },
  });
  setIo(io);

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Missing auth token"));
    try {
      const payload = verifyToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.userId!;
    socket.join(userRoom(userId));

    // Live send path (mirrors POST /messages). The REST endpoint remains the
    // canonical way to send; this exists for a snappy socket-only client.
    socket.on(
      "message:send",
      async (
        payload: { toUserId: string; body: string },
        ack?: (result: unknown) => void
      ) => {
        try {
          const body = (payload?.body ?? "").toString().trim().slice(0, 2000);
          const toUserId = payload?.toUserId;
          if (!body || !toUserId) throw new Error("Invalid message");
          if (!(await canMessage(userId, toUserId))) {
            throw new Error("Not allowed to message this user");
          }
          const sender = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
          const message = await prisma.message.create({
            data: { fromUserId: userId, toUserId, body },
          });
          emitToUser(toUserId, "message:new", message);
          emitToUser(userId, "message:new", message); // echo to sender's other tabs
          await notify(toUserId, "MESSAGE", `New message from ${sender.name}`);
          ack?.({ ok: true, message });
        } catch (err) {
          ack?.({ ok: false, error: (err as Error).message });
        }
      }
    );

    // --- Rooms (real-time) using Redis as backing store. Channels are
    // `room:<id>` for membership and `room_channel:<id>` as Socket.IO room.
    socket.on("room:create", async (payload: { name: string }, ack?: (res: any) => void) => {
      try {
        const name = (payload?.name ?? "").toString().slice(0, 200);
        if (!name) throw new Error("Invalid name");
        if (!redisReady()) throw new Error("Redis unavailable");
        const id = crypto.randomBytes(8).toString("hex");
        await redis.sadd("rooms", id);
        await redis.hset(`room:${id}`, { name, creatorId: userId });
        await redis.sadd(`room:${id}:members`, userId);
        socket.join(`room_channel:${id}`);
        io.emit("room:created", { id, name });
        ack?.({ ok: true, id, name });
      } catch (err) {
        ack?.({ ok: false, error: (err as Error).message });
      }
    });

    socket.on("room:join", async (payload: { roomId: string }, ack?: (res: any) => void) => {
      try {
        const roomId = payload?.roomId;
        if (!roomId) throw new Error("roomId required");
        if (!redisReady()) throw new Error("Redis unavailable");
        const exists = await redis.sismember("rooms", roomId);
        if (!exists) throw new Error("Room not found");
        await redis.sadd(`room:${roomId}:members`, userId);
        socket.join(`room_channel:${roomId}`);
        const members = await redis.scard(`room:${roomId}:members`);
        io.to(`room_channel:${roomId}`).emit("room:member:joined", { roomId, userId, members });
        ack?.({ ok: true, roomId, members });
      } catch (err) {
        ack?.({ ok: false, error: (err as Error).message });
      }
    });

    socket.on("room:leave", async (payload: { roomId: string }, ack?: (res: any) => void) => {
      try {
        const roomId = payload?.roomId;
        if (!roomId) throw new Error("roomId required");
        if (!redisReady()) throw new Error("Redis unavailable");
        await redis.srem(`room:${roomId}:members`, userId);
        socket.leave(`room_channel:${roomId}`);
        const members = await redis.scard(`room:${roomId}:members`);
        io.to(`room_channel:${roomId}`).emit("room:member:left", { roomId, userId, members });
        ack?.({ ok: true, roomId, members });
      } catch (err) {
        ack?.({ ok: false, error: (err as Error).message });
      }
    });

    socket.on("room:message", async (payload: { roomId: string; body: string }, ack?: (res: any) => void) => {
      try {
        const { roomId, body } = payload || {};
        if (!roomId || !body) throw new Error("Invalid payload");
        const text = body.toString().slice(0, 2000).trim();
        if (!text) throw new Error("Empty message");
        // Broadcast to room channel
        io.to(`room_channel:${roomId}`).emit("room:message", { roomId, from: userId, body: text, createdAt: new Date() });
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: (err as Error).message });
      }
    });
  });

  return io;
}
