import { prisma } from "../lib/prisma";

export interface MentorRow {
  id: string;
  name: string;
  level: number;
  xp: number;
  batch: string;
}

// Eligible mentors = users in the same college who are at least 2 levels above
// the requester (core-spec rule: "message seniors 2+ levels above").
export async function getEligibleMentors(userId: string): Promise<MentorRow[]> {
  const me = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const mentors = await prisma.user.findMany({
    where: {
      collegeId: me.collegeId,
      id: { not: me.id },
      level: { gte: me.level + 2 },
    },
    orderBy: [{ level: "desc" }, { xp: "desc" }],
    select: { id: true, name: true, level: true, xp: true, batch: true },
  });
  return mentors;
}

// Whether `fromUserId` is allowed to message `toUserId` (mentor rule, either
// direction: a mentor may always reply to a mentee who reached out).
export async function canMessage(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  if (fromUserId === toUserId) return false;
  const [from, to] = await Promise.all([
    prisma.user.findUnique({ where: { id: fromUserId } }),
    prisma.user.findUnique({ where: { id: toUserId } }),
  ]);
  if (!from || !to) return false;
  if (from.collegeId !== to.collegeId) return false;

  // mentee → mentor (target is 2+ levels above), or mentor → mentee (reply).
  const targetIsMentor = to.level >= from.level + 2;
  const senderIsMentor = from.level >= to.level + 2;
  return targetIsMentor || senderIsMentor;
}
