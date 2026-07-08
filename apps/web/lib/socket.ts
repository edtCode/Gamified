import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

let socket: Socket | null = null;

export function getSocket() {
  const token = getToken();
  if (!token) return null;
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!socketUrl && process.env.NODE_ENV === "production") return null;
  if (!socket) {
    socket = io(socketUrl ?? "http://localhost:4000", {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
}

export function resetSocket() {
  socket?.disconnect();
  socket = null;
}
