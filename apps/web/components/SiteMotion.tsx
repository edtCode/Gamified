"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function SiteMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scope = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const cursorDot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = scope.current;
    if (!target) return;

    gsap.fromTo(
      target.querySelectorAll("[data-animate]"),
      { autoAlpha: 0, y: 14, filter: "blur(6px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power3.out",
        stagger: 0.045,
      }
    );
  }, [pathname]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || !cursor.current || !cursorDot.current) return;

    const cursorEl = cursor.current;
    const dotEl = cursorDot.current;
    const moveCursor = (event: PointerEvent) => {
      gsap.to(cursorEl, { x: event.clientX, y: event.clientY, duration: 0.22, ease: "power3.out" });
      gsap.to(dotEl, { x: event.clientX, y: event.clientY, duration: 0.04, ease: "none" });
    };
    const grow = () => gsap.to(cursorEl, { scale: 1.85, opacity: 0.82, duration: 0.18, ease: "power2.out" });
    const shrink = () => gsap.to(cursorEl, { scale: 1, duration: 0.2, ease: "power2.out" });
    const lift = (event: Event) => {
      gsap.to(event.currentTarget, { y: -3, scale: 1.015, duration: 0.22, ease: "power3.out" });
    };
    const settle = (event: Event) => {
      gsap.to(event.currentTarget, { y: 0, scale: 1, duration: 0.28, ease: "elastic.out(1, 0.55)" });
    };
    const press = (event: Event) => {
      gsap.to(event.currentTarget, { scale: 0.985, duration: 0.08, ease: "power2.out" });
    };

    window.addEventListener("pointermove", moveCursor);
    document.querySelectorAll("a, button, input, textarea, select").forEach((node) => {
      node.addEventListener("pointerenter", grow);
      node.addEventListener("pointerleave", shrink);
    });
    document.querySelectorAll(".motion-button").forEach((node) => {
      node.addEventListener("pointerenter", lift);
      node.addEventListener("pointerleave", settle);
      node.addEventListener("pointerdown", press);
      node.addEventListener("pointerup", lift);
    });

    return () => {
      window.removeEventListener("pointermove", moveCursor);
      document.querySelectorAll("a, button, input, textarea, select").forEach((node) => {
        node.removeEventListener("pointerenter", grow);
        node.removeEventListener("pointerleave", shrink);
      });
      document.querySelectorAll(".motion-button").forEach((node) => {
        node.removeEventListener("pointerenter", lift);
        node.removeEventListener("pointerleave", settle);
        node.removeEventListener("pointerdown", press);
        node.removeEventListener("pointerup", lift);
      });
    };
  }, [pathname]);

  return (
    <>
      <div ref={scope}>{children}</div>
      <div
        ref={cursor}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/70 bg-ink/10 shadow-[0_10px_30px_rgba(60,63,69,0.22)] backdrop-blur-[1px] md:block"
      />
      <div
        ref={cursorDot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink md:block"
      />
    </>
  );
}
