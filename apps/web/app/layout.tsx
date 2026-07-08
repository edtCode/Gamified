import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SiteMotion } from "@/components/SiteMotion";

export const metadata: Metadata = {
  title: "Gamified College Learning",
  description: "Level up through learning tasks, mentors, streaks, and batch leaderboards."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <SiteMotion>{children}</SiteMotion>
        </Providers>
      </body>
    </html>
  );
}
