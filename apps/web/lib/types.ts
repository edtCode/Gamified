export type User = {
  id: string;
  name: string;
  email: string;
  batch: string;
  role: "STUDENT" | "ADMIN";
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number | null;
  currentLevelMinXp: number;
  xpIntoLevel: number;
  xpForThisLevel: number;
  streakCount: number;
  emailVerified: boolean;
  college: { id: string; name: string; emailDomain: string };
  badgeCount: number;
  tasksCompleted: number;
};

export type Track = {
  id: string;
  slug: string;
  name: string;
  description: string;
  order: number;
  taskCount: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  order: number;
  levelRequired: number;
  completed: boolean;
  completedAt: string | null;
  locked: boolean;
};

export type Badge = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  awardedAt?: string;
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
};

export type Mentor = {
  id: string;
  name: string;
  batch: string;
  level: number;
  xp: number;
};

export type Message = {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  body: string;
  read: boolean;
  createdAt: string;
};
