import { useEffect, useRef } from 'react';

export default function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    let released = false;

    async function acquire() {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (e) {
        // Wake lock request failed (e.g. low battery)
      }
    }

    acquire();

    // Re-acquire on visibility change (needed after tab switch)
    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && !released) {
        acquire();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);
}
