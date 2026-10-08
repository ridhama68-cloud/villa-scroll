"use client";

import React, { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import gsap from "gsap";

export interface SpatialZone {
  id: string;
  roomNumber: string;
  roomName: string;
  title: string;
  spec: string;
  description: string;
  frameStart: number;
  frameEnd: number;
  position: "bottom-left" | "bottom-right";
}

export const SPATIAL_ZONES: SpatialZone[] = [
  {
    id: "entrance",
    roomNumber: "01",
    roomName: "Entrance",
    title: "Monolithic Threshold",
    spec: "Honed Roman Travertine · Linear Shadow Gap",
    description: "A monumental entry sequence defined by tectonic mass, soft ambient shadows, and warm travertine surfaces.",
    frameStart: 10,
    frameEnd: 155,
    position: "bottom-left",
  },
  {
    id: "living-room",
    roomNumber: "02",
    roomName: "Living Room",
    title: "The Grand Pavilion",
    spec: "4.2m Cantilevered Volume · Structural Bronze Panes",
    description: "Continuous spatial transitions connecting the monolithic hearth to panoramic coastal horizons.",
    frameStart: 165,
    frameEnd: 310,
    position: "bottom-right",
  },
  {
    id: "kitchen",
    roomNumber: "03",
    roomName: "Kitchen",
    title: "Culinary Atelier",
    spec: "Brushed Gunmetal Joinery · Fluted Quartzite Island",
    description: "Pure geometric forms concealing functional apparatus within textured natural stone.",
    frameStart: 320,
    frameEnd: 465,
    position: "bottom-left",
  },
  {
    id: "bedroom",
    roomNumber: "04",
    roomName: "Bedroom",
    title: "Master Sanctuary",
    spec: "Acoustic Slatted Cedar · Concealed Circadian Glow",
    description: "An intimate refuge calibrated for acoustic tranquility and soft morning daylight capture.",
    frameStart: 475,
    frameEnd: 620,
    position: "bottom-right",
  },
  {
    id: "bathroom",
    roomNumber: "05",
    roomName: "Bathroom",
    title: "Elemental Stone Spa",
    spec: "Carved Basalt Monolith · Thermostatic Rain Assembly",
    description: "Sculptural privacy shaped by monolithic stone basins and seamless micro-cement surfaces.",
    frameStart: 630,
    frameEnd: 775,
    position: "bottom-left",
  },
  {
    id: "garden",
    roomNumber: "06",
    roomName: "Garden",
    title: "Terrace & Waterline",
    spec: "Endless Horizon Lap · Indigenous Coastal Flora",
    description: "Boundless alfresco living balancing reflective water, cedar decking, and sunset panoramas.",
    frameStart: 785,
    frameEnd: 955,
    position: "bottom-right",
  },
];

export interface SpatialTimelineOverlaysHandle {
  update: (frame: number, progress: number) => void;
}

export interface SpatialTimelineOverlaysProps {
  initialFrame?: number;
}

/**
 * Overlay components for the interior scroll timeline:
 * (Entrance, Living Room, Kitchen, Bedroom, Bathroom, Garden)
 * - Driven by specific frame ranges.
 * - Glassmorphism cards with minimal aesthetic text.
 * - Positioned on sides/bottom so architecture is never blocked.
 * - Subtle GSAP mouse parallax tilt effect on active cards.
 * - Smoothly animated with opacity, translateY, and blur via GSAP.
 */
const SpatialTimelineOverlays = forwardRef<
  SpatialTimelineOverlaysHandle,
  SpatialTimelineOverlaysProps
>(function SpatialTimelineOverlays({ initialFrame = 1 }, ref) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnersRef = useRef<(HTMLDivElement | null)[]>([]);
  const breadcrumbDotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const breadcrumbLabelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const activeZonesStatusRef = useRef<boolean[]>(new Array(SPATIAL_ZONES.length).fill(false));
  const activeZoneIdxRef = useRef<number>(-1);

  // Apply frame update
  const applyFrameUpdate = (frame: number) => {
    let currentActive = -1;

    SPATIAL_ZONES.forEach((zone, idx) => {
      const isNowActive = frame >= zone.frameStart && frame <= zone.frameEnd;
      if (isNowActive) currentActive = idx;

      const wasActive = activeZonesStatusRef.current[idx];
      if (isNowActive === wasActive) return; // No state change

      activeZonesStatusRef.current[idx] = isNowActive;
      const card = cardsRef.current[idx];

      if (card) {
        if (isNowActive) {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(card, {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          });
        }
      }

      // Update breadcrumb dot
      const dot = breadcrumbDotsRef.current[idx];
      const label = breadcrumbLabelsRef.current[idx];
      if (dot) {
        dot.className = isNowActive
          ? "w-1.5 h-1.5 rounded-full bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.9)] transition-all duration-300"
          : "w-1.5 h-1.5 rounded-full bg-zinc-700 transition-all duration-300";
      }
      if (label) {
        label.className = `text-[10px] font-mono uppercase tracking-wider transition-colors duration-200 ${
          isNowActive ? "text-zinc-100 font-medium" : "text-zinc-500"
        }`;
      }
    });

    activeZoneIdxRef.current = currentActive;
  };

  useImperativeHandle(ref, () => ({
    update: (frame: number) => {
      applyFrameUpdate(frame);
    },
  }));

  // Initial mount trigger
  useEffect(() => {
    applyFrameUpdate(initialFrame);
  }, [initialFrame]);

  // Subtle Mouse Parallax Effect on Active Card
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      const activeIdx = activeZoneIdxRef.current;
      if (activeIdx === -1) return;

      const cardInner = cardInnersRef.current[activeIdx];
      if (!cardInner) return;

      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      // Subtle high-end 3D parallax tilt & displacement
      gsap.to(cardInner, {
        x: nx * 8,
        y: ny * 6,
        rotateY: nx * 3,
        rotateX: -ny * 3,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      const activeIdx = activeZoneIdxRef.current;
      if (activeIdx === -1) return;

      const cardInner = cardInnersRef.current[activeIdx];
      if (cardInner) {
        gsap.to(cardInner, {
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none [perspective:1000px]">
      {/* 6 Spatial Glassmorphism Cards */}
      {SPATIAL_ZONES.map((zone, idx) => {
        const isLeft = zone.position === "bottom-left";

        return (
          <div
            key={zone.id}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            style={{
              opacity: 0,
              transform: "translateY(20px)",
              filter: "blur(10px)",
            }}
            className={`absolute bottom-16 sm:bottom-20 ${
              isLeft ? "left-6 sm:left-10 md:left-16" : "right-6 sm:right-10 md:right-16 text-right"
            } max-w-[340px] sm:max-w-sm md:max-w-md w-full pointer-events-auto`}
          >
            {/* Inner Tilt Container for Parallax */}
            <div
              ref={(el) => {
                cardInnersRef.current[idx] = el;
              }}
              className="relative rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/25 will-change-transform group"
            >
              {/* Subtle Ambient Gold Accent Line */}
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

              {/* Room Tag & Index */}
              <div
                className={`flex items-center gap-2 mb-2.5 ${
                  isLeft ? "justify-start" : "justify-end flex-row-reverse"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-300/90 font-medium">
                  {zone.roomNumber} // {zone.roomName}
                </span>
                <span className="text-[10px] font-mono text-zinc-600">
                  · frames {zone.frameStart}-{zone.frameEnd}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight leading-snug">
                {zone.title}
              </h2>

              {/* Description */}
              <p className="text-xs text-zinc-400 font-light leading-relaxed mt-2 line-clamp-3">
                {zone.description}
              </p>

              {/* Architectural Material Specification Badge */}
              <div
                className={`mt-4 pt-3.5 border-t border-white/5 flex items-center gap-2 ${
                  isLeft ? "justify-start" : "justify-end"
                }`}
              >
                <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300 tracking-wide">
                  {zone.spec}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Spatial Breadcrumb Indicator on Bottom Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 pointer-events-auto">
        {SPATIAL_ZONES.map((zone, idx) => (
          <div key={zone.id} className="flex items-center gap-1.5">
            <span
              ref={(el) => {
                breadcrumbDotsRef.current[idx] = el;
              }}
              className="w-1.5 h-1.5 rounded-full bg-zinc-700 transition-all duration-300"
            />
            <span
              ref={(el) => {
                breadcrumbLabelsRef.current[idx] = el;
              }}
              className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 transition-colors duration-200"
            >
              {zone.roomName}
            </span>
            {idx < SPATIAL_ZONES.length - 1 && (
              <span className="text-zinc-700 text-[10px] ml-1">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SpatialTimelineOverlays;
