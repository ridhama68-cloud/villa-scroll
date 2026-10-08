"use client";

import React, { useRef, useCallback } from "react";
import CanvasSequence from "../components/CanvasSequence";
import HeroOverlay, { HeroOverlayHandle } from "../components/HeroOverlay";
import SpatialTimelineOverlays, {
  SpatialTimelineOverlaysHandle,
} from "../components/SpatialTimelineOverlays";
import FloatingProgressNav, {
  FloatingProgressNavHandle,
} from "../components/FloatingProgressNav";
import CustomCursor from "../components/CustomCursor";
import VisualEffects from "../components/VisualEffects";
import { useLenis } from "../hooks/useLenis";

export default function Home() {
  // Initialize Lenis smooth scroll synchronized to GSAP ScrollTrigger ticker
  const { scrollTo } = useLenis({
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  // Direct element references for zero-re-render 60/120 FPS performance
  const heroRef = useRef<HeroOverlayHandle | null>(null);
  const timelineRef = useRef<SpatialTimelineOverlaysHandle | null>(null);
  const floatingNavRef = useRef<FloatingProgressNavHandle | null>(null);
  const scrubberFillRef = useRef<HTMLDivElement | null>(null);
  const scrubberDotRef = useRef<HTMLDivElement | null>(null);

  // Called strictly when the calculated frame changes via ScrollTrigger
  const handleFrameChange = useCallback((frame: number, progress: number) => {
    // 1. Update transparent/blur navbar & scroll indicator fade
    heroRef.current?.update(progress);

    // 2. Update 6-zone spatial timeline glassmorphism overlays via GSAP
    timelineRef.current?.update(frame, progress);

    // 3. Update right-side floating progress navigation
    floatingNavRef.current?.update(frame, progress);

    // 4. Update bottom timeline scrubber
    if (scrubberFillRef.current) {
      scrubberFillRef.current.style.width = `${Math.round(progress * 100)}%`;
    }
    if (scrubberDotRef.current) {
      scrubberDotRef.current.style.left = `calc(16px + (100% - 32px) * ${progress})`;
    }
  }, []);

  // Smooth programmatic scroll when navigating
  const handleNavigate = useCallback(
    (target: number | string) => {
      if (typeof target === "number") {
        // Map 0..1 ratio to pinned sequence scroll height (5000px)
        scrollTo(target * 5000, { duration: 1.2 });
      } else {
        scrollTo(target, { duration: 1.2 });
      }
    },
    [scrollTo]
  );

  // Manual scrub click
  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    scrollTo(ratio * 5000, { duration: 0.8 });
  };

  return (
    <main className="relative bg-[#090a0f] text-white selection:bg-amber-400 selection:text-black">
      {/* Luxury Interactive Cursor */}
      <CustomCursor />

      {/* Visual Polish: Film Grain & Soft Cinema Vignette */}
      <VisualEffects />

      {/* Floating Progress Navigation fixed to the right side */}
      <FloatingProgressNav ref={floatingNavRef} onNavigate={handleNavigate} />

      {/* ONE PINNED SCROLLTRIGGER SECTION (Apple AirPods style) */}
      <CanvasSequence
        totalFrames={960}
        initialFramesCount={150}
        scrollDistance={5000}
        onFrameChange={handleFrameChange}
      >
        {/* Minimal Premium Hero Section with Transparent-to-Blur Navbar */}
        <HeroOverlay ref={heroRef} onNavigate={handleNavigate} />

        {/* 6 Spatial Glassmorphism Overlays with GSAP Mouse Parallax */}
        <SpatialTimelineOverlays ref={timelineRef} initialFrame={1} />

        {/* Floating Minimal Scrubber Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[85%] max-w-sm pointer-events-auto">
          <div
            onClick={handleScrubClick}
            className="group cursor-pointer relative h-8 px-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center shadow-2xl hover:border-white/30 transition-all"
          >
            <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden relative">
              <div
                ref={scrubberFillRef}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-75"
                style={{ width: "0%" }}
              />
            </div>

            <div
              ref={scrubberDotRef}
              className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] -translate-x-1/2 pointer-events-none transition-all duration-75"
              style={{ left: "16px" }}
            />
          </div>
        </div>
      </CanvasSequence>

      {/* Architectural Specifications & Private Inquiry Section */}
      <section
        id="inquire"
        className="relative z-30 bg-[#090a0f] border-t border-white/10 py-32 px-6 sm:px-12 md:px-20"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[11px] uppercase tracking-[0.4em] text-amber-400 font-mono">
              Architectural Specifications
            </span>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white leading-tight">
              A Bespoke Sanctuary in Prime Coastal Enclave.
            </h3>
            <p className="text-zinc-400 font-light leading-relaxed">
              Designed as an interplay between structural mass and transparent vistas, Villa Horizon encompasses 12,400 sq.ft of conditioned living volume with triple-height glazing.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Internal Area</span>
                <span className="text-lg text-white font-light">12,400 SQ.FT</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Terrace Deck</span>
                <span className="text-lg text-white font-light">4,800 SQ.FT</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Ceiling Clear</span>
                <span className="text-lg text-white font-light">4.2 METERS</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Frame Sequence</span>
                <span className="text-lg text-amber-300 font-light">1080P // 960 FRAMES</span>
              </div>
            </div>
          </div>

          {/* Acquisition Request Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-6 backdrop-blur-xl shadow-2xl">
            <h4 className="text-xl font-light text-white tracking-tight">
              Request Architectural Dossier
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Receive confidential floor plans, material schedules, and arrange a private site visit.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you. An architectural advisor will contact you shortly.");
              }}
              className="space-y-4"
            >
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Direct Email Address"
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg bg-white text-black text-xs uppercase tracking-[0.25em] font-medium hover:bg-amber-400 transition-colors shadow-lg cursor-pointer"
              >
                Submit Private Inquiry
              </button>
            </form>
          </div>
        </div>

        {/* Footer Return To Top */}
        <div className="max-w-6xl mx-auto pt-24 flex items-center justify-between text-xs text-zinc-600 font-mono border-t border-white/5 mt-20">
          <span>© VILLA HORIZON // ALL RIGHTS RESERVED</span>
          <button
            onClick={() => handleNavigate(0)}
            className="text-zinc-400 hover:text-amber-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Return to Top ↑
          </button>
        </div>
      </section>
    </main>
  );
}
