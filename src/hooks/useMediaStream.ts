import { useEffect, useRef, useState } from 'react';

export default function useMediaStream(enabled: boolean, facingMode: string = 'environment') {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<unknown>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        streamRef.current = s;
        setStream(s);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStream(null);
      }
    };
  }, [enabled, facingMode]);

  return { stream, error };
}
