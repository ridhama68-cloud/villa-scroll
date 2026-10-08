"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";

export interface HeroOverlayHandle {
  update: (progress: number) => void;
}

export interface HeroOverlayProps {
  /** Function to jump/scroll to a specific space or section */
  onNavigate?: (targetProgress: number | string) => void;
}

/**
 * Minimal premium hero section.
 * - Architecture remains the hero (no giant center headings or clutter).
 * - Transparent navbar that adds a frosted blur background when scrolling.
 * - Elegant logo in top-left.
 * - Minimal navigation in top-right.
 * - Small animated scroll indicator in bottom-center that fades out on scroll.
 */
const HeroOverlay = forwardRef<HeroOverlayHandle, HeroOverlayProps>(function HeroOverlay(
  { onNavigate },
  ref
) {
  const headerRef = useRef<HTMLElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const isScrolledRef = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    update: (progress: number) => {
      // 1. Transparent navbar that adds a frosted blur background when scrolling
      const isScrolled = progress > 0.015;
      if (isScrolled !== isScrolledRef.current && headerRef.current) {
        isScrolledRef.current = isScrolled;
        if (isScrolled) {
          headerRef.current.style.backgroundColor = "rgba(9, 10, 15, 0.55)";
          headerRef.current.style.backdropFilter = "blur(16px)";
          headerRef.current.style.borderBottomColor = "rgba(255, 255, 255, 0.08)";
          headerRef.current.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4)";
        } else {
          headerRef.current.style.backgroundColor = "transparent";
          headerRef.current.style.backdropFilter = "blur(0px)";
          headerRef.current.style.borderBottomColor = "transparent";
          headerRef.current.style.boxShadow = "none";
        }
      }

      // 2. Fade out bottom scroll indicator
      if (scrollIndicatorRef.current) {
        const opacity = Math.max(0, 1 - progress * 20);
        scrollIndicatorRef.current.style.opacity = String(opacity);
        scrollIndicatorRef.current.style.transform = `translateY(${progress * 40}px)`;
        scrollIndicatorRef.current.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
      }
    },
  }));

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between select-none">
      {/* Top Navbar: Transparent by default, adds blur background when scrolling */}
      <header
        ref={headerRef}
        style={{
          backgroundColor: "transparent",
          backdropFilter: "blur(0px)",
          borderBottomColor: "transparent",
        }}
        className="w-full fixed top-0 left-0 right-0 z-40 px-6 sm:px-10 md:px-14 py-4 md:py-5 flex items-center justify-between border-b transition-all duration-500 ease-out pointer-events-auto"
      >
        {/* Elegant Top-Left Logo */}
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => onNavigate?.(0)}
        >
          <div className="w-8 h-8 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:border-amber-400/60 group-hover:bg-black/60 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.35em] font-light text-white transition-colors group-hover:text-amber-200">
              Villa Horizon
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-mono">
              Architectural Sequence
            </span>
          </div>
        </div>

        {/* Minimalist Top-Right Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-xs font-light text-zinc-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <button
            onClick={() => onNavigate?.(0.08)}
            className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all text-[11px] tracking-wider uppercase font-mono text-zinc-400"
          >
            Spaces
          </button>
          <button
            onClick={() => onNavigate?.(0.41)}
            className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all text-[11px] tracking-wider uppercase font-mono text-zinc-400"
          >
            Kitchen
          </button>
          <button
            onClick={() => onNavigate?.(0.9)}
            className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all text-[11px] tracking-wider uppercase font-mono text-zinc-400"
          >
            Garden
          </button>
          <button
            onClick={() => onNavigate?.("#inquire")}
            className="ml-1 px-3.5 py-1 rounded-full bg-white/90 text-black font-medium text-[11px] uppercase tracking-[0.15em] hover:bg-amber-400 transition-colors shadow-sm"
          >
            Inquire
          </button>
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-20" />

      {/* Small, Animated Scroll Indicator at Bottom Center */}
      <div
        ref={scrollIndicatorRef}
        onClick={() => onNavigate?.(0.08)}
        className="self-center flex flex-col items-center gap-3 cursor-pointer group pb-8 transition-all duration-200 pointer-events-auto"
      >
        <span className="text-[10px] uppercase font-mono tracking-[0.35em] text-zinc-400 group-hover:text-amber-300 transition-colors">
          Scroll to explore
        </span>

        {/* Sleek Animated Mouse / Scroll Pill */}
        <div className="w-5 h-9 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-start justify-center p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.4)] group-hover:border-amber-400/50 transition-colors">
          <div className="w-1 h-2 rounded-full bg-amber-400 animate-bounce shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        </div>
      </div>
    </div>
  );
});

export default HeroOverlay;
