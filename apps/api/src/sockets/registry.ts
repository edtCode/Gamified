import { Server as SocketServer } from "socket.io";

// Holds the Socket.IO server instance so services (messages, notifications,
// badges) can push events to connected clients. Each authenticated socket
// joins a room named after its user id (see sockets/index.ts), so emitting to
// `user:<id>` reaches all of that user's open tabs/devices.
let io: SocketServer | null = null;

export function setIo(server: SocketServer): void {
  io = server;
}

export function getIo(): SocketServer | null {
  return io;
}

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(userRoom(userId)).emit(event, payload);
}
