import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Level thresholds (level reached when xp >= minXp) ---
const LEVELS: { level: number; minXp: number; title: string }[] = [
  { level: 1, minXp: 0, title: "Novice" },
  { level: 2, minXp: 100, title: "Explorer" },
  { level: 3, minXp: 250, title: "Apprentice" },
  { level: 4, minXp: 450, title: "Practitioner" },
  { level: 5, minXp: 700, title: "Craftsman" },
  { level: 6, minXp: 1000, title: "Specialist" },
  { level: 7, minXp: 1400, title: "Expert" },
  { level: 8, minXp: 1900, title: "Mentor" },
  { level: 9, minXp: 2500, title: "Master" },
  { level: 10, minXp: 3200, title: "Legend" },
];

function levelForXp(xp: number): number {
  let level = 1;
  for (const l of LEVELS) if (xp >= l.minXp) level = l.level;
  return level;
}

// --- Tracks & tasks ---
const TRACKS: {
  slug: string;
  name: string;
  description: string;
  order: number;
  tasks: { title: string; description: string; xpReward: number; levelRequired: number }[];
}[] = [
  {
    slug: "basics",
    name: "Programming Basics",
    description: "Core language fundamentals every developer needs.",
    order: 1,
    tasks: [
      { title: "Set up your dev environment", description: "Install an editor, runtime, and Git.", xpReward: 50, levelRequired: 1 },
      { title: "Variables & data types", description: "Understand primitives, strings, and collections.", xpReward: 50, levelRequired: 1 },
      { title: "Control flow & loops", description: "Write conditionals and iterate over data.", xpReward: 60, levelRequired: 1 },
      { title: "Functions & modules", description: "Break code into reusable functions.", xpReward: 70, levelRequired: 1 },
    ],
  },
  {
    slug: "dsa",
    name: "Data Structures & Algorithms",
    description: "Problem-solving foundations for interviews.",
    order: 2,
    tasks: [
      { title: "Arrays & strings", description: "Two-pointer and sliding-window patterns.", xpReward: 80, levelRequired: 2 },
      { title: "Hashmaps & sets", description: "O(1) lookups and frequency counting.", xpReward: 80, levelRequired: 2 },
      { title: "Recursion & trees", description: "Traverse trees and think recursively.", xpReward: 100, levelRequired: 3 },
      { title: "Sorting & searching", description: "Binary search and common sorts.", xpReward: 100, levelRequired: 3 },
    ],
  },
  {
    slug: "projects",
    name: "Build Projects",
    description: "Ship real applications end-to-end.",
    order: 3,
    tasks: [
      { title: "Build a CLI tool", description: "A small command-line utility.", xpReward: 120, levelRequired: 3 },
      { title: "Build a REST API", description: "CRUD endpoints with a database.", xpReward: 140, levelRequired: 4 },
      { title: "Build a full-stack app", description: "Frontend + backend + auth.", xpReward: 160, levelRequired: 4 },
      { title: "Deploy to production", description: "Ship it live with CI/CD.", xpReward: 160, levelRequired: 5 },
    ],
  },
  {
    slug: "resume",
    name: "Resume & Portfolio",
    description: "Package your work for recruiters.",
    order: 4,
    tasks: [
      { title: "Write a one-page resume", description: "Impact-focused bullet points.", xpReward: 100, levelRequired: 4 },
      { title: "Build a portfolio site", description: "Showcase your best projects.", xpReward: 120, levelRequired: 5 },
      { title: "Optimize your LinkedIn", description: "Keywords, headline, and network.", xpReward: 90, levelRequired: 5 },
    ],
  },
  {
    slug: "interviews",
    name: "Interview Prep",
    description: "Get interview-ready and land the offer.",
    order: 5,
    tasks: [
      { title: "Mock coding interview", description: "Solve problems under time pressure.", xpReward: 150, levelRequired: 5 },
      { title: "System design basics", description: "Design scalable systems.", xpReward: 180, levelRequired: 6 },
      { title: "Behavioral interview (STAR)", description: "Structure your stories.", xpReward: 120, levelRequired: 6 },
      { title: "Negotiation & offers", description: "Evaluate and negotiate offers.", xpReward: 150, levelRequired: 7 },
    ],
  },
];

// --- Badges ---
const BADGES: {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteria: Prisma.InputJsonValue;
}[] = [
  { slug: "first-step", name: "First Step", description: "Complete your first task.", icon: "👣", criteria: { type: "TASKS_COMPLETED", count: 1 } },
  { slug: "getting-started", name: "Getting Started", description: "Complete 5 tasks.", icon: "🌱", criteria: { type: "TASKS_COMPLETED", count: 5 } },
  { slug: "completionist", name: "Completionist", description: "Complete 20 tasks.", icon: "🏆", criteria: { type: "TASKS_COMPLETED", count: 20 } },
  { slug: "basics-master", name: "Basics Master", description: "Finish the Programming Basics track.", icon: "📘", criteria: { type: "TRACK_COMPLETED", trackSlug: "basics" } },
  { slug: "dsa-master", name: "DSA Master", description: "Finish the Data Structures & Algorithms track.", icon: "🧠", criteria: { type: "TRACK_COMPLETED", trackSlug: "dsa" } },
  { slug: "rising-star", name: "Rising Star", description: "Reach level 5.", icon: "⭐", criteria: { type: "LEVEL_REACHED", level: 5 } },
  { slug: "senior-dev", name: "Senior Dev", description: "Reach level 8.", icon: "🦾", criteria: { type: "LEVEL_REACHED", level: 8 } },
  { slug: "on-fire", name: "On Fire", description: "Hold a 7-day streak.", icon: "🔥", criteria: { type: "STREAK_REACHED", days: 7 } },
];

// --- Demo users (all share password "password123") ---
const DEMO_USERS: { name: string; email: string; batch: string; xp: number; streak: number }[] = [
  { name: "Aarav Sharma", email: "aarav@example.edu", batch: "2027", xp: 60, streak: 1 },
  { name: "Diya Patel", email: "diya@example.edu", batch: "2027", xp: 300, streak: 3 },
  { name: "Ishaan Verma", email: "ishaan@example.edu", batch: "2027", xp: 520, streak: 2 },
  { name: "Kabir Singh", email: "kabir@example.edu", batch: "2027", xp: 1050, streak: 5 },
  { name: "Meera Nair", email: "meera@example.edu", batch: "2027", xp: 2000, streak: 9 },
  { name: "Sara Khan", email: "sara@example.edu", batch: "2027", xp: 780, streak: 4 },
  { name: "Rohan Gupta", email: "rohan@example.edu", batch: "2026", xp: 720, streak: 2 },
  { name: "Neha Reddy", email: "neha@example.edu", batch: "2026", xp: 260, streak: 1 },
  { name: "Arjun Mehta", email: "arjun@example.edu", batch: "2026", xp: 1450, streak: 6 },
  { name: "Ananya Das", email: "ananya@example.edu", batch: "2026", xp: 2600, streak: 11 },
  { name: "Vivaan Joshi", email: "vivaan@example.edu", batch: "2026", xp: 480, streak: 2 },
  { name: "Tara Iyer", email: "tara@example.edu", batch: "2026", xp: 990, streak: 3 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Reset (idempotent seed): clear dependent rows first.
  await prisma.userBadge.deleteMany();
  await prisma.userTask.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.track.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.college.deleteMany();
  await prisma.levelDef.deleteMany();

  // Levels
  await prisma.levelDef.createMany({ data: LEVELS });

  // College
  const college = await prisma.college.create({
    data: { name: "Example University", emailDomain: "example.edu" },
  });

  // Tracks + tasks
  for (const t of TRACKS) {
    await prisma.track.create({
      data: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        order: t.order,
        tasks: {
          create: t.tasks.map((task, i) => ({
            title: task.title,
            description: task.description,
            xpReward: task.xpReward,
            levelRequired: task.levelRequired,
            order: i + 1,
          })),
        },
      },
    });
  }

  // Badges
  await prisma.badge.createMany({ data: BADGES });

  // Demo users
  const passwordHash = await bcrypt.hash("password123", 10);
  for (const u of DEMO_USERS) {
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        batch: u.batch,
        collegeId: college.id,
        xp: u.xp,
        level: levelForXp(u.xp),
        streakCount: u.streak,
        lastActiveOn: new Date(),
        emailVerified: true,
      },
    });
  }

  const trackCount = await prisma.track.count();
  const taskCount = await prisma.task.count();
  console.log(`✅ Seeded: 1 college, ${LEVELS.length} levels, ${trackCount} tracks, ${taskCount} tasks, ${BADGES.length} badges, ${DEMO_USERS.length} users.`);
  console.log("\n👤 Demo logins (password: password123):");
  for (const u of DEMO_USERS) {
    console.log(`   ${u.email.padEnd(24)} batch ${u.batch}  ~level ${levelForXp(u.xp)}`);
  }
  console.log("\n➡️  Or sign up fresh with any @example.edu email at http://localhost:3000/signup\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
