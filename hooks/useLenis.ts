"use client";

import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

// Static default easing function defined outside to prevent reference churn
const DEFAULT_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export interface UseLenisOptions {
  /** Duration of scroll animation in seconds (default: 1.2 for cinematic feel) */
  duration?: number;
  /** Custom easing function */
  easing?: (t: number) => number;
  /** Scroll orientation: "vertical" | "horizontal" (default: "vertical") */
  orientation?: "vertical" | "horizontal";
  /** Gesture orientation: "vertical" | "horizontal" (default: "vertical") */
  gestureOrientation?: "vertical" | "horizontal";
  /** Smooth scrolling for mouse wheel events (default: true) */
  smoothWheel?: boolean;
  /** Touch sensitivity multiplier (default: 1.5) */
  touchMultiplier?: number;
  /** Whether to sync automatically with GSAP ScrollTrigger (default: true) */
  syncScrollTrigger?: boolean;
  /** Whether smooth scrolling is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Custom React hook that initializes Lenis smooth scrolling,
 * connects it to GSAP ScrollTrigger ticker, and provides clean teardown on unmount.
 *
 * Designed to be zero-re-render and completely immune to infinite update loops.
 */
export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  // Store options in a ref so inline option objects never trigger effect re-execution
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (optionsRef.current.enabled === false) return;

    // Register ScrollTrigger with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize Lenis instance
    const lenis = new Lenis({
      duration: optionsRef.current.duration ?? 1.2,
      easing: optionsRef.current.easing ?? DEFAULT_EASING,
      orientation: optionsRef.current.orientation ?? "vertical",
      gestureOrientation: optionsRef.current.gestureOrientation ?? "vertical",
      smoothWheel: optionsRef.current.smoothWheel ?? true,
      touchMultiplier: optionsRef.current.touchMultiplier ?? 1.5,
    });

    lenisRef.current = lenis;

    // 2. Connect Lenis scroll updates to GSAP ScrollTrigger
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScroll);

    // 3. Bind GSAP's master ticker to Lenis.raf so GSAP drives the scroll updates
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);

    // Disable lag smoothing to prevent animation jumps during asset loads
    gsap.ticker.lagSmoothing(0);

    // Notify ScrollTrigger of the updated layout
    ScrollTrigger.refresh();

    // 4. Teardown cleanup function (zero setState calls to prevent update depth errors)
    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.off("scroll", handleScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []); // Run ONCE on mount

  // Stable programmatic scroll helper
  const scrollTo = useCallback(
    (target: number | string | HTMLElement, scrollOptions?: Parameters<Lenis["scrollTo"]>[1]) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, scrollOptions);
      } else if (typeof window !== "undefined") {
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: "smooth" });
        } else if (typeof target === "string") {
          document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    []
  );

  return {
    lenisRef,
    scrollTo,
    get instance() {
      return lenisRef.current;
    },
  };
}

export default useLenis;
