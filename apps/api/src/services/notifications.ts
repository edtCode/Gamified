import { prisma } from "../lib/prisma";
import { emitToUser } from "../sockets/registry";

export type NotificationType =
  | "LEVEL_UP"
  | "BADGE"
  | "MESSAGE"
  | "STREAK"
  | "SYSTEM";

// Create a notification row and push it live to the user over Socket.IO.
export async function notify(
  userId: string,
  type: NotificationType,
  body: string
) {
  const notification = await prisma.notification.create({
    data: { userId, type, body },
  });
  emitToUser(userId, "notification:new", notification);
  return notification;
}
