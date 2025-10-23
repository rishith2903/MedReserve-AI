import { useEffect, useRef } from 'react';

// Simple polling hook with visibility pause and cleanup
export default function useRealtimePoll(callback, intervalMs = 60000, deps = []) {
  const savedCallback = useRef(callback);
  const timerId = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = async () => {
      try {
        await savedCallback.current?.();
      } catch (_) {}
    };

    const start = () => {
      if (timerId.current) return;
      timerId.current = setInterval(() => {
        if (document.hidden) return; // pause when tab hidden
        tick();
      }, intervalMs);
    };

    const stop = () => {
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
    };

    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}




