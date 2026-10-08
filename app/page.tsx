"use client";

import React, { useRef, useCallback, useEffect } from "react";
import CanvasSequence from "../components/CanvasSequence";

export default function Home() {
  // Direct DOM references for zero-re-render UI updates
  const frameCounterRef = useRef<HTMLSpanElement | null>(null);
  const scrubberFillRef = useRef<HTMLDivElement | null>(null);
  const scrubberDotRef = useRef<HTMLDivElement | null>(null);

  // Text overlay section refs
  const card1Ref = useRef<HTMLDivElement | null>(null);
  const card2Ref = useRef<HTMLDivElement | null>(null);
  const card3Ref = useRef<HTMLDivElement | null>(null);
  const card4Ref = useRef<HTMLDivElement | null>(null);

  // Update story captions based on strict scroll progress
  const updateCardOpacity = (el: HTMLDivElement | null, active: boolean) => {
    if (!el) return;
    el.style.opacity = active ? "1" : "0";
    el.style.transform = active ? "translateY(0px)" : "translateY(16px)";
  };

  // Called strictly when the calculated frame changes via ScrollTrigger
  const handleFrameChange = useCallback((frame: number, progress: number) => {
    // 1. Frame counter
    if (frameCounterRef.current) {
      frameCounterRef.current.textContent = String(frame).padStart(4, "0");
    }

    // 2. Scrubber progress bar
    if (scrubberFillRef.current) {
      scrubberFillRef.current.style.width = `${Math.round(progress * 100)}%`;
    }
    if (scrubberDotRef.current) {
      scrubberDotRef.current.style.left = `calc(16px + (100% - 32px) * ${progress})`;
    }

    // 3. Editorial text milestones (fade in / out cleanly)
    updateCardOpacity(card1Ref.current, progress >= 0.04 && progress <= 0.22);
    updateCardOpacity(card2Ref.current, progress >= 0.28 && progress <= 0.48);
    updateCardOpacity(card3Ref.current, progress >= 0.54 && progress <= 0.74);
    updateCardOpacity(card4Ref.current, progress >= 0.80 && progress <= 0.98);
  }, []);

  // Jump to specific scroll ratio when clicking on scrubber bar
  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    // Pinned section height is 5000px
    const targetScrollY = ratio * 5000;
    window.scrollTo({ top: targetScrollY, behavior: "auto" });
  };

  return (
    <main className="relative bg-[#090a0f] text-white selection:bg-amber-400 selection:text-black">
      {/* Top Floating Luxury Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 pointer-events-auto backdrop-blur-sm bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="text-xs uppercase tracking-[0.3em] font-light text-zinc-300">
            Villa Horizon
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
            <span>FRAME</span>
            <span ref={frameCounterRef} className="text-amber-300 font-semibold tabular-nums">
              0001
            </span>
            <span className="text-zinc-600">/</span>
            <span>0960</span>
          </div>

          <a
            href="#inquire"
            className="text-xs uppercase tracking-[0.25em] px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-amber-400/50 transition-all text-zinc-200"
          >
            Inquire
          </a>
        </div>
      </header>

      {/* ONE PINNED SCROLLTRIGGER SECTION (Apple AirPods style) */}
      <CanvasSequence
        totalFrames={960}
        initialFramesCount={150}
        scrollDistance={5000}
        onFrameChange={handleFrameChange}
      >
        {/* Story Card 1: Architectural Genesis */}
        <div
          ref={card1Ref}
          style={{ opacity: 0, transform: "translateY(16px)" }}
          className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-28 px-8 md:px-20 transition-all duration-300 ease-out z-20"
        >
          <div className="max-w-xl space-y-4">
            <span className="text-[11px] uppercase tracking-[0.4em] text-amber-400/90 font-mono">
              01 // Architectural Genesis
            </span>
            <h1 className="text-4xl md:text-7xl font-light tracking-tight text-white leading-tight">
              Spatial Purity in Motion.
            </h1>
            <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed">
              Monolithic limestone, bronze fenestrations, and boundless natural illumination
              orchestrated across 960 cinematic frames.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs tracking-widest uppercase text-zinc-500 font-mono">
              <span className="animate-bounce">↓</span>
              <span>Scroll wheel to scrub through residence</span>
            </div>
          </div>
        </div>

        {/* Story Card 2: The Grand Pavilion */}
        <div
          ref={card2Ref}
          style={{ opacity: 0, transform: "translateY(16px)" }}
          className="absolute inset-0 pointer-events-none flex flex-col justify-center px-8 md:px-20 items-end text-right transition-all duration-300 ease-out z-20"
        >
          <div className="max-w-lg space-y-4">
            <span className="text-[11px] uppercase tracking-[0.4em] text-amber-400/90 font-mono">
              02 // The Grand Pavilion
            </span>
            <h2 className="text-3xl md:text-6xl font-light tracking-tight text-white leading-tight">
              A Symphony of Stone & Air.
            </h2>
            <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed">
              Continuity between indoor tranquility and untamed coastal horizons, defined by 4.2-meter
              cantilevered ceilings and micro-cement transitions.
            </p>
          </div>
        </div>

        {/* Story Card 3: Materiality & Tactility */}
        <div
          ref={card3Ref}
          style={{ opacity: 0, transform: "translateY(16px)" }}
          className="absolute inset-0 pointer-events-none flex flex-col justify-center px-8 md:px-20 transition-all duration-300 ease-out z-20"
        >
          <div className="max-w-lg space-y-4">
            <span className="text-[11px] uppercase tracking-[0.4em] text-amber-400/90 font-mono">
              03 // Materiality & Tactility
            </span>
            <h2 className="text-3xl md:text-6xl font-light tracking-tight text-white leading-tight">
              Every Surface Engineered to Resonate.
            </h2>
            <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed">
              Hand-brushed gunmetal fixtures, bespoke fluted Italian travertine, and integrated
              indirect ambient illumination calibrated for circadian comfort.
            </p>
          </div>
        </div>

        {/* Story Card 4: The Residence */}
        <div
          ref={card4Ref}
          style={{ opacity: 0, transform: "translateY(16px)" }}
          className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center text-center px-6 transition-all duration-300 ease-out z-20"
        >
          <div className="max-w-xl space-y-6">
            <span className="text-[11px] uppercase tracking-[0.4em] text-amber-400/90 font-mono">
              04 // The Residence
            </span>
            <h2 className="text-4xl md:text-7xl font-light tracking-tight text-white">
              Claim the Horizon.
            </h2>
            <p className="text-zinc-400 text-sm md:text-base font-light">
              Scroll down to review architectural specifications or arrange an exclusive private walkthrough.
            </p>
          </div>
        </div>
      </CanvasSequence>

      {/* Floating Interactive Scrubber Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md pointer-events-auto">
        <div
          onClick={handleScrubClick}
          className="group cursor-pointer relative h-9 px-4 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center shadow-2xl hover:border-white/30 transition-all"
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
            className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] -translate-x-1/2 pointer-events-none transition-all duration-75"
            style={{ left: "16px" }}
          />
        </div>
      </div>

      {/* Subsequent Content Section (Scrolls naturally past the pinned section) */}
      <section id="inquire" className="relative z-30 bg-[#0c0d12] border-t border-white/10 py-32 px-8 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[11px] uppercase tracking-[0.4em] text-amber-400 font-mono">
              Architectural Specifications
            </span>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white">
              Bespoke Sanctuary in Prime Coastal Enclave.
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
                <span className="text-zinc-500 block uppercase tracking-wider">Frame Resolution</span>
                <span className="text-lg text-amber-300 font-light">1080P // 960 FRAMES</span>
              </div>
            </div>
          </div>

          {/* Acquisition Request Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-6">
            <h4 className="text-xl font-light text-white tracking-tight">
              Request Architectural Dossier
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Receive confidential floor plans, material schedules, and schedule a private site visit.
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
                className="w-full py-3.5 rounded-lg bg-white text-black text-xs uppercase tracking-[0.25em] font-medium hover:bg-amber-400 transition-colors"
              >
                Submit Private Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
