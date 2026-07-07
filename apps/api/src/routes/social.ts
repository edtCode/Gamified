import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../lib/http";
import { requireAuth } from "../middleware/auth";
import { getEligibleMentors, canMessage } from "../services/mentors";
import { notify } from "../services/notifications";
import { emitToUser } from "../sockets/registry";

export const socialRouter = Router();

// GET /mentors — users 2+ levels above the requester (same college).
socialRouter.get(
  "/mentors",
  requireAuth,
  asyncHandler(async (req, res) => {
    const mentors = await getEligibleMentors(req.user!.sub);
    res.json({ mentors });
  })
);

// GET /conversations — distinct people the user has chatted with + last message
// and unread count.
socialRouter.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const messages = await prisma.message.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: { select: { id: true, name: true, level: true } },
        toUser: { select: { id: true, name: true, level: true } },
      },
    });

    const byPartner = new Map<
      string,
      { partner: { id: string; name: string; level: number }; lastMessage: string; lastAt: Date; unread: number }
    >();

    for (const m of messages) {
      const partner = m.fromUserId === userId ? m.toUser : m.fromUser;
      const entry = byPartner.get(partner.id);
      const isUnread = m.toUserId === userId && !m.read;
      if (!entry) {
        byPartner.set(partner.id, {
          partner,
          lastMessage: m.body,
          lastAt: m.createdAt,
          unread: isUnread ? 1 : 0,
        });
      } else if (isUnread) {
        entry.unread += 1;
      }
    }

    res.json({ conversations: Array.from(byPartner.values()) });
  })
);

// GET /messages/:userId — full thread with a partner; marks their messages read.
socialRouter.get(
  "/messages/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const partnerId = req.params.userId;

    const partner = await prisma.user.findUnique({ where: { id: partnerId } });
    if (!partner) throw new HttpError(404, "User not found.");

    await prisma.message.updateMany({
      where: { fromUserId: partnerId, toUserId: userId, read: false },
      data: { read: true },
    });

    const thread = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId, toUserId: partnerId },
          { fromUserId: partnerId, toUserId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      partner: { id: partner.id, name: partner.name, level: partner.level },
      messages: thread,
    });
  })
);

const sendSchema = z.object({
  toUserId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

// POST /messages — send a DM (enforces the mentor eligibility rule).
socialRouter.post(
  "/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const fromUserId = req.user!.sub;
    const { toUserId, body } = sendSchema.parse(req.body);

    if (!(await canMessage(fromUserId, toUserId))) {
      throw new HttpError(
        403,
        "You can only message mentors 2+ levels above you (or reply to your mentees)."
      );
    }

    const sender = await prisma.user.findUniqueOrThrow({ where: { id: fromUserId } });
    const message = await prisma.message.create({
      data: { fromUserId, toUserId, body },
    });

    // Push the message live to the recipient and notify them.
    emitToUser(toUserId, "message:new", message);
    await notify(toUserId, "MESSAGE", `New message from ${sender.name}`);

    res.status(201).json({ message });
  })
);
