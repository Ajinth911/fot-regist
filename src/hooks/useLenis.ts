import { useEffect } from 'react';
import Lenis from 'lenis';

export function useLenis() {
  useEffect(() => {
    // Only initialize smooth scroll on non-touch desktop / tablets
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let rafId: number;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}
