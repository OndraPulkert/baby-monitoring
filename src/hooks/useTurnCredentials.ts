import { useState, useEffect } from 'react';

const WORKER_URL = 'https://baby-monitor-turn.ondrejpulkert.workers.dev';

const STUN_ONLY: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export default function useTurnCredentials(): RTCIceServer[] | null {
  const [iceServers, setIceServers] = useState<RTCIceServer[] | null>(null);

  useEffect(() => {
    fetch(WORKER_URL, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        const turn: RTCIceServer = data.iceServers;
        setIceServers(turn ? [...STUN_ONLY, turn] : STUN_ONLY);
      })
      .catch(() => {
        setIceServers(STUN_ONLY);
      });
  }, []);

  return iceServers;
}