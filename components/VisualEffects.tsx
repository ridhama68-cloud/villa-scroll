"use client";

import React from "react";

/**
 * Premium visual polish layers:
 * 1. Subtle procedural film grain overlay (mix-blend-overlay).
 * 2. Soft cinema vignette around the viewport borders.
 * Built with pointer-events-none and zero layout impact.
 */
export default function VisualEffects() {
  return (
    <>
      {/* Soft Vignette around screen edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] sm:shadow-[inset_0_0_130px_rgba(0,0,0,0.8)] md:shadow-[inset_0_0_180px_rgba(0,0,0,0.88)]"
      />

      {/* Subtle Procedural Film Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay will-change-transform"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
