import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../lib/http";
import { requireAuth } from "../middleware/auth";

export const notificationsRouter = Router();

// GET /notifications — recent notifications + unread count.
notificationsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    res.json({ notifications: items, unread });
  })
);

// POST /notifications/:id/read — mark one notification read.
notificationsRouter.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notification || notification.userId !== userId) {
      throw new HttpError(404, "Notification not found.");
    }
    await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true },
    });
    res.json({ ok: true });
  })
);

// POST /notifications/read-all — mark everything read.
notificationsRouter.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, read: false },
      data: { read: true },
    });
    res.json({ ok: true });
  })
);
