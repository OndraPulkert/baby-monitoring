import { useEffect, useRef, useState, useCallback } from 'react';

const THRESHOLD = 0.25;
const SUSTAIN_MS = 2500;
const COOLDOWN_MS = 15000;

interface AlarmSound {
  ctx: AudioContext;
  osc: OscillatorNode;
  interval: ReturnType<typeof setInterval>;
}

export default function useCryAlarm(level: number, enabled: boolean) {
  const [alarming, setAlarming] = useState(false);
  const loudSinceRef = useRef<number | null>(null);
  const cooldownUntilRef = useRef(0);
  const alarmRef = useRef<AlarmSound | null>(null);

  const stopAlarmSound = useCallback(() => {
    if (alarmRef.current) {
      clearInterval(alarmRef.current.interval);
      alarmRef.current.osc.stop();
      alarmRef.current.ctx.close().catch(() => {});
      alarmRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || alarming) return;

    const now = Date.now();
    if (now < cooldownUntilRef.current) {
      loudSinceRef.current = null;
      return;
    }

    if (level >= THRESHOLD) {
      if (loudSinceRef.current === null) {
        loudSinceRef.current = now;
      } else if (now - loudSinceRef.current >= SUSTAIN_MS) {
        setAlarming(true);

        // Start alarm sound
        try {
          const ctx = new AudioContext();
          const gainNode = ctx.createGain();
          gainNode.gain.value = 0.3;
          gainNode.connect(ctx.destination);
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 800;
          osc.connect(gainNode);
          osc.start();
          let high = true;
          const interval = setInterval(() => {
            high = !high;
            osc.frequency.setValueAtTime(high ? 800 : 600, ctx.currentTime);
          }, 500);
          alarmRef.current = { ctx, osc, interval };
        } catch {}

        // Vibrate
        navigator.vibrate?.([300, 200, 300, 200, 300]);

        // Show notification — prefer Service Worker (visible on lock screen), fallback to page Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const swReady = navigator.serviceWorker?.ready;
          if (swReady) {
            swReady.then(reg =>
              reg.showNotification('Baby Monitor', {
                body: 'Baby is crying!',
                tag: 'baby-cry',
                requireInteraction: true,
                vibrate: [300, 200, 300, 200, 300],
              } as NotificationOptions)
            ).catch(() => {
              try { new Notification('Baby Monitor', { body: 'Baby is crying!', tag: 'baby-cry' }); } catch {}
            });
          } else {
            try { new Notification('Baby Monitor', { body: 'Baby is crying!', tag: 'baby-cry' }); } catch {}
          }
        }
      }
    } else {
      loudSinceRef.current = null;
    }
  }, [level, enabled, alarming]);

  const dismiss = useCallback(() => {
    stopAlarmSound();
    navigator.vibrate?.(0);
    setAlarming(false);
    loudSinceRef.current = null;
    cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
  }, [stopAlarmSound]);

  useEffect(() => stopAlarmSound, [stopAlarmSound]);

  return { alarming, dismiss };
}
