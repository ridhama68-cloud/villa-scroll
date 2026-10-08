"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Luxury custom cursor:
 * - High-precision center dot and a trailing frosted amber ring.
 * - Interpolated via GSAP quickTo for silky 60/120 FPS motion.
 * - Automatically expands when hovering buttons, links, and cards.
 * - Cleanly disabled on touch screens and unmounted listeners.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [isFinePointer, setIsFinePointer] = useState<boolean>(false);

  useEffect(() => {
    // Only mount on desktop devices with fine pointer (mouse/trackpad)
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    if (!media.matches) return;

    setIsFinePointer(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Use GSAP quickTo for silky, hardware-accelerated pointer interpolation
    const setDotX = gsap.quickTo(dot, "x", { duration: 0.05, ease: "power2.out" });
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.05, ease: "power2.out" });

    const setRingX = gsap.quickTo(ring, "x", { duration: 0.22, ease: "power2.out" });
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.22, ease: "power2.out" });

    let isHoveringInteractive = false;

    const handleMouseMove = (e: MouseEvent) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);

      if (dot.style.opacity === "0") {
        gsap.to([dot, ring], { opacity: 1, duration: 0.25, overwrite: "auto" });
      }

      // Check if hovering over clickable or interactive element
      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest("a, button, input, [role='button'], .cursor-pointer, textarea")
      );

      if (isInteractive !== isHoveringInteractive) {
        isHoveringInteractive = isInteractive;

        if (isInteractive) {
          gsap.to(ring, {
            scale: 1.8,
            borderColor: "rgba(251, 191, 36, 0.7)",
            backgroundColor: "rgba(251, 191, 36, 0.08)",
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(dot, {
            scale: 0.5,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          gsap.to(ring, {
            scale: 1,
            borderColor: "rgba(255, 255, 255, 0.3)",
            backgroundColor: "transparent",
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(dot, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    const handleMouseLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.3, overwrite: "auto" });
    };

    const handleMouseEnter = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[100] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] will-change-transform"
      />

      {/* Trailing Outer Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[99] w-8 h-8 rounded-full border border-white/30 backdrop-blur-[0.5px] will-change-transform transition-colors duration-200"
      />
    </>
  );
}
