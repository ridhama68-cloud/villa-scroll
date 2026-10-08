"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import gsap from "gsap";

export interface NavRoom {
  id: string;
  number: string;
  name: string;
  frameStart: number;
  frameEnd: number;
  targetProgress: number;
}

export const NAV_ROOMS: NavRoom[] = [
  {
    id: "entrance",
    number: "01",
    name: "Entrance",
    frameStart: 10,
    frameEnd: 155,
    targetProgress: 0.08,
  },
  {
    id: "living-room",
    number: "02",
    name: "Living Room",
    frameStart: 165,
    frameEnd: 310,
    targetProgress: 0.24,
  },
  {
    id: "kitchen",
    number: "03",
    name: "Kitchen",
    frameStart: 320,
    frameEnd: 465,
    targetProgress: 0.41,
  },
  {
    id: "bedroom",
    number: "04",
    name: "Bedroom",
    frameStart: 475,
    frameEnd: 620,
    targetProgress: 0.57,
  },
  {
    id: "bathroom",
    number: "05",
    name: "Bathroom",
    frameStart: 630,
    frameEnd: 775,
    targetProgress: 0.73,
  },
  {
    id: "garden",
    number: "06",
    name: "Garden",
    frameStart: 785,
    frameEnd: 955,
    targetProgress: 0.90,
  },
];

export interface FloatingProgressNavHandle {
  update: (frame: number, progress: number) => void;
}

export interface FloatingProgressNavProps {
  onNavigate?: (targetProgress: number) => void;
}

/**
 * Floating Progress Navigation fixed to the right side of the screen.
 * - Minimalist indicator lines & dots for each architectural room.
 * - Automatically highlights the active room as ScrollTrigger progresses.
 * - Clicking a room smoothly scrolls using Lenis.
 * - Zero-re-render update handle for 60/120 FPS performance.
 */
const FloatingProgressNav = forwardRef<FloatingProgressNavHandle, FloatingProgressNavProps>(
  function FloatingProgressNav({ onNavigate }, ref) {
    const linesRef = useRef<(HTMLDivElement | null)[]>([]);
    const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
    const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
    const activeIndexRef = useRef<number>(-1);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({
      update: (frame: number) => {
        let activeIdx = -1;

        NAV_ROOMS.forEach((room, idx) => {
          const isActive = frame >= room.frameStart && frame <= room.frameEnd;
          if (isActive) activeIdx = idx;

          const line = linesRef.current[idx];
          const dot = dotsRef.current[idx];
          const label = labelsRef.current[idx];

          if (isActive) {
            if (line) {
              gsap.to(line, {
                width: 28,
                backgroundColor: "#f59e0b",
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
            if (dot) {
              gsap.to(dot, {
                scale: 1.35,
                backgroundColor: "#fbbf24",
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
            if (label) {
              gsap.to(label, {
                opacity: 1,
                x: 0,
                color: "#ffffff",
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          } else {
            if (line) {
              gsap.to(line, {
                width: 12,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
            if (dot) {
              gsap.to(dot, {
                scale: 1,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
            if (label) {
              gsap.to(label, {
                opacity: 0,
                x: 10,
                color: "#71717a",
                duration: 0.25,
                ease: "power2.in",
                overwrite: "auto",
              });
            }
          }
        });

        activeIndexRef.current = activeIdx;
      },
    }));

    return (
      <aside
        aria-label="Spatial Progress Navigation"
        className="fixed right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 pointer-events-auto flex flex-col items-end gap-5 select-none"
      >
        <div className="flex flex-col items-end gap-4 p-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl">
          {NAV_ROOMS.map((room, idx) => (
            <button
              key={room.id}
              onClick={() => onNavigate?.(room.targetProgress)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group relative flex items-center gap-3 py-1 px-1.5 focus:outline-none cursor-pointer"
              aria-label={`Jump to ${room.name}`}
            >
              {/* Tooltip Label (Appears on hover or when room is active) */}
              <span
                ref={(el) => {
                  labelsRef.current[idx] = el;
                }}
                style={{
                  opacity: hoveredIdx === idx ? 1 : 0,
                  transform: hoveredIdx === idx ? "translateX(0px)" : "translateX(10px)",
                }}
                className={`hidden md:inline-block absolute right-10 whitespace-nowrap px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] shadow-lg pointer-events-none transition-all duration-200 ${
                  hoveredIdx === idx ? "text-amber-300" : "text-zinc-300"
                }`}
              >
                <span className="text-amber-400 font-bold mr-1.5">{room.number}</span>
                {room.name}
              </span>

              {/* Indicator Dot */}
              <div
                ref={(el) => {
                  dotsRef.current[idx] = el;
                }}
                className="w-1.5 h-1.5 rounded-full bg-white/30 transition-transform duration-300 group-hover:scale-125 group-hover:bg-amber-300"
              />

              {/* Indicator Line */}
              <div
                ref={(el) => {
                  linesRef.current[idx] = el;
                }}
                className="h-[1.5px] w-3 rounded-full bg-white/20 transition-all duration-300 group-hover:w-5 group-hover:bg-amber-400/80"
              />
            </button>
          ))}
        </div>
      </aside>
    );
  }
);

export default FloatingProgressNav;
