"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CanvasSequenceProps {
  /** Total frames in sequence (default: 960) */
  totalFrames?: number;
  /** Frames to load before dismissing preloader (default: 150) */
  initialFramesCount?: number;
  /** Scroll distance for the pinned section in pixels (default: 5000) */
  scrollDistance?: number;
  /** Frame path prefix (default: "/frames/frame_") */
  framePrefix?: string;
  /** Frame image extension (default: ".jpg") */
  frameExtension?: string;
  /** Digit padding length (default: 4) */
  padDigits?: number;
  /** Callback on frame change with current 1-based frame and progress (0 to 1) */
  onFrameChange?: (frameIndex: number, progress: number) => void;
  /** Callback fired when the initial 150 frames finish preloading */
  onInitialLoadComplete?: () => void;
  /** Callback fired when all 960 frames are cached in background */
  onAllFramesLoaded?: () => void;
  /** Optional custom className for the pinned section container */
  className?: string;
  /** Optional children overlays (e.g. text cards) positioned inside the pinned section */
  children?: React.ReactNode;
}

export default function CanvasSequence({
  totalFrames = 960,
  initialFramesCount = 150,
  scrollDistance = 5000,
  framePrefix = "/frames/frame_",
  frameExtension = ".jpg",
  padDigits = 4,
  onFrameChange,
  onInitialLoadComplete,
  onAllFramesLoaded,
  className = "",
  children,
}: CanvasSequenceProps) {
  // Pinned container and Canvas references
  const pinSectionRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preloader DOM references for 60fps zero-react-render updates
  const percentTextRef = useRef<HTMLSpanElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const countTextRef = useRef<HTMLParagraphElement | null>(null);

  // In-memory cache of HTMLImageElement objects (1-based index)
  const imagesCache = useRef<(HTMLImageElement | null)[]>([]);

  // Frame and render tracking (STRICT: no animation loops, no autoplay)
  const currentFrameRef = useRef<number>(1);
  const renderPendingRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);

  // Callbacks ref to prevent effect recreation
  const callbacksRef = useRef({
    onFrameChange,
    onInitialLoadComplete,
    onAllFramesLoaded,
  });
  useEffect(() => {
    callbacksRef.current = {
      onFrameChange,
      onInitialLoadComplete,
      onAllFramesLoaded,
    };
  });

  // Preloader lifecycle state
  const [isPreloaderDone, setIsPreloaderDone] = useState<boolean>(false);
  const [preloaderOpacity, setPreloaderOpacity] = useState<"visible" | "fading" | "removed">("visible");

  // Format image URL
  const getFrameUrl = useCallback(
    (index: number) => {
      const padded = String(index).padStart(padDigits, "0");
      return `${framePrefix}${padded}${frameExtension}`;
    },
    [framePrefix, padDigits, frameExtension]
  );

  // Draw an image onto the canvas with cover sizing and HiDPI Retina support
  const drawToCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const displayW = Math.round(width * dpr);
    const displayH = Math.round(height * dpr);

    if (canvas.width !== displayW || canvas.height !== displayH) {
      canvas.width = displayW;
      canvas.height = displayH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Object-fit: cover calculation
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const ratio = Math.max(width / imgW, height / imgH);

    const renderW = imgW * ratio;
    const renderH = imgH * ratio;
    const shiftX = (width - renderW) / 2;
    const shiftY = (height - renderH) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, imgW, imgH, shiftX, shiftY, renderW, renderH);

    ctx.restore();
  }, []);

  // Render a specific frame index (or closest loaded frame)
  const renderFrame = useCallback(
    (targetIndex: number) => {
      const clamped = Math.max(1, Math.min(totalFrames, targetIndex));
      const cached = imagesCache.current[clamped];

      if (cached && cached.complete && cached.naturalWidth > 0) {
        drawToCanvas(cached);
        return;
      }

      // If frame is still buffering, render the nearest loaded frame to eliminate flicker
      let nearestImg: HTMLImageElement | null = null;
      let minDistance = Infinity;

      for (let i = 1; i <= totalFrames; i++) {
        const candidate = imagesCache.current[i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          const dist = Math.abs(i - clamped);
          if (dist < minDistance) {
            minDistance = dist;
            nearestImg = candidate;
          }
        }
      }

      if (nearestImg) {
        drawToCanvas(nearestImg);
      }

      // Immediately prioritize fetching the missing frame
      if (!cached) {
        const priorityImg = new Image();
        priorityImg.src = getFrameUrl(clamped);
        priorityImg.onload = () => {
          imagesCache.current[clamped] = priorityImg;
          // Redraw only if the user is currently stopped at this exact frame
          if (currentFrameRef.current === clamped) {
            drawToCanvas(priorityImg);
          }
        };
      }
    },
    [totalFrames, drawToCanvas, getFrameUrl]
  );

  // Helper to load a single frame
  const loadSingleFrame = useCallback(
    (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesCache.current[index]?.complete) {
          resolve(imagesCache.current[index]!);
          return;
        }

        const img = new Image();
        img.src = getFrameUrl(index);

        img.onload = () => {
          imagesCache.current[index] = img;
          resolve(img);
        };

        img.onerror = () => {
          imagesCache.current[index] = img;
          resolve(img);
        };
      });
    },
    [getFrameUrl]
  );

  // Resize listener: redraw current frame on resize
  useEffect(() => {
    const handleResize = () => {
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [renderFrame]);

  // Phase 1: Preload initial 150 frames on mount
  useEffect(() => {
    isCancelledRef.current = false;
    imagesCache.current = new Array(totalFrames + 1).fill(null);

    const initialTarget = Math.min(initialFramesCount, totalFrames);
    let loadedCount = 0;

    const updatePreloaderUI = (count: number) => {
      const pct = Math.min(100, Math.round((count / initialTarget) * 100));
      if (percentTextRef.current) {
        percentTextRef.current.textContent = String(pct);
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${pct}%`;
      }
      if (countTextRef.current) {
        countTextRef.current.textContent = `Buffering Initial Sequence (${count}/${initialTarget})`;
      }
    };

    const loadInitialBatch = async () => {
      const initialIndices = Array.from({ length: initialTarget }, (_, i) => i + 1);
      const CONCURRENCY = 12;
      let currentIndex = 0;

      const worker = async () => {
        while (currentIndex < initialIndices.length && !isCancelledRef.current) {
          const frameIndex = initialIndices[currentIndex++];
          await loadSingleFrame(frameIndex);
          loadedCount++;

          if (!isCancelledRef.current) {
            updatePreloaderUI(loadedCount);

            // Draw frame 1 as soon as it arrives
            if (frameIndex === 1 && imagesCache.current[1]) {
              drawToCanvas(imagesCache.current[1]!);
            }
          }
        }
      };

      const workers = Array.from(
        { length: Math.min(CONCURRENCY, initialIndices.length) },
        () => worker()
      );
      await Promise.all(workers);

      if (isCancelledRef.current) return;

      // Ensure Frame 1 is painted
      if (imagesCache.current[1]) {
        drawToCanvas(imagesCache.current[1]!);
      }

      setIsPreloaderDone(true);
      callbacksRef.current.onInitialLoadComplete?.();

      // Smooth fade-out of preloader
      setTimeout(() => {
        if (!isCancelledRef.current) {
          setPreloaderOpacity("fading");
          setTimeout(() => {
            if (!isCancelledRef.current) {
              setPreloaderOpacity("removed");
            }
          }, 700);
        }
      }, 200);

      // Phase 2: Background caching of frames 151 to 960 (non-blocking)
      startBackgroundCache();
    };

    const startBackgroundCache = async () => {
      if (initialTarget >= totalFrames) {
        callbacksRef.current.onAllFramesLoaded?.();
        return;
      }

      const remaining = Array.from(
        { length: totalFrames - initialTarget },
        (_, i) => initialTarget + 1 + i
      );

      const BG_CONCURRENCY = 6;
      let nextIdx = 0;

      const bgWorker = async () => {
        while (nextIdx < remaining.length && !isCancelledRef.current) {
          const frameNum = remaining[nextIdx++];
          await loadSingleFrame(frameNum);

          // If user scrolled and is frozen on this exact frame, redraw now
          if (currentFrameRef.current === frameNum && imagesCache.current[frameNum]) {
            drawToCanvas(imagesCache.current[frameNum]!);
          }

          // Small yield to event loop
          await new Promise((res) => setTimeout(res, 4));
        }
      };

      const bgWorkers = Array.from({ length: BG_CONCURRENCY }, () => bgWorker());
      await Promise.all(bgWorkers);

      if (!isCancelledRef.current) {
        callbacksRef.current.onAllFramesLoaded?.();
      }
    };

    loadInitialBatch();

    return () => {
      isCancelledRef.current = true;
    };
  }, [totalFrames, initialFramesCount, loadSingleFrame, drawToCanvas]);

  // Phase 3: Pinned ScrollTrigger scrubbing setup (STRICT REQUIREMENTS)
  // 1. One pinned ScrollTrigger section.
  // 2. Direct mouse wheel / touch scroll controls the frame number.
  // 3. No autoplay, no setInterval, no animation loop.
  // 4. Frame changes ONLY when ScrollTrigger progress changes.
  // 5. When scrolling stops, current frame stays FROZEN.
  // 6. Reverse scrolling reverses frames perfectly.
  // 7. requestAnimationFrame is used ONLY to render after scroll updates.
  useEffect(() => {
    if (!isPreloaderDone || !pinSectionRef.current) return;

    // Refresh ScrollTrigger layout
    ScrollTrigger.refresh();

    const st = ScrollTrigger.create({
      trigger: pinSectionRef.current,
      start: "top top",
      end: `+=${scrollDistance}`,
      pin: true,
      // scrub: 0 provides 1:1 direct coupling without inertia lag
      scrub: 0,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Requirement 9: Map ScrollTrigger progress (0 to 1) to image sequence
        const progress = self.progress;
        const targetFrame = Math.min(
          totalFrames,
          Math.max(1, Math.floor(progress * (totalFrames - 1)) + 1)
        );

        // Requirement 10: Redraw the canvas ONLY when the calculated frame changes
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;

          // Requirement 15: Use requestAnimationFrame ONLY to render after scroll updates
          if (!renderPendingRef.current) {
            renderPendingRef.current = true;
            requestAnimationFrame(() => {
              renderFrame(currentFrameRef.current);
              renderPendingRef.current = false;
            });
          }

          callbacksRef.current.onFrameChange?.(currentFrameRef.current, progress);
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [isPreloaderDone, scrollDistance, totalFrames, renderFrame]);

  return (
    <div
      ref={pinSectionRef}
      className={`relative w-full h-screen overflow-hidden bg-[#090a0f] select-none ${className}`}
    >
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block object-cover pointer-events-none will-change-transform"
      />

      {/* Children overlays (such as text titles) pinned alongside the canvas */}
      {children}

      {/* Preloader Overlay (disappears permanently once 150 frames are buffered) */}
      {preloaderOpacity !== "removed" && (
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#090a0c] text-white transition-opacity duration-700 ease-out ${
            preloaderOpacity === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-400 font-medium mb-8">
              Villa Spatial Sequence
            </p>

            <div className="relative mb-6">
              <span
                ref={percentTextRef}
                className="font-mono text-6xl md:text-7xl font-extralight tracking-tighter text-white tabular-nums"
              >
                0
              </span>
              <span className="font-mono text-2xl font-light text-amber-400/80 ml-1">%</span>
            </div>

            <div className="w-64 h-[2px] bg-zinc-800/80 rounded-full overflow-hidden relative shadow-inner mb-5">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                style={{ width: "0%" }}
              />
            </div>

            <p
              ref={countTextRef}
              className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono"
            >
              Buffering Initial Sequence (0/{initialFramesCount})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
