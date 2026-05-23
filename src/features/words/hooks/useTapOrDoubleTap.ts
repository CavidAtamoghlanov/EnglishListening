import { useRef } from "react";

type Options = {
  onSingleTap: () => void;
  onDoubleTap: () => void;
  delayMs?: number;
};

export function useTapOrDoubleTap({ onSingleTap, onDoubleTap, delayMs = 240 }: Options) {
  const lastTapRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < delayMs;
    lastTapRef.current = now;

    if (isDoubleTap) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onDoubleTap();
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onSingleTap();
    }, delayMs);
  };
}
