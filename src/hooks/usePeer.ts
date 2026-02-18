import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';

type PeerStatus = 'connecting' | 'open' | 'error' | 'closed';

export default function usePeer(peerId: string, iceServers: RTCIceServer[] | null) {
  const [status, setStatus] = useState<PeerStatus>('connecting');
  const peerRef = useRef<Peer | null>(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    if (!peerId || !iceServers) return;
    destroyedRef.current = false;

    const peer = new Peer(peerId, {
      debug: 1,
      config: { iceServers },
    });
    peerRef.current = peer;

    peer.on('open', () => {
      if (!destroyedRef.current) setStatus('open');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (!destroyedRef.current) {
        // "peer-unavailable" means the remote peer doesn't exist yet - not a real error
        if (err.type !== 'peer-unavailable') {
          setStatus('error');
        }
      }
    });

    peer.on('disconnected', () => {
      if (!destroyedRef.current) {
        setStatus('connecting');
        setTimeout(() => {
          if (!destroyedRef.current && !peer.destroyed && peer.disconnected) {
            peer.reconnect();
          }
        }, 2000);
      }
    });

    peer.on('close', () => {
      if (!destroyedRef.current) setStatus('closed');
    });

    return () => {
      destroyedRef.current = true;
      peer.destroy();
      peerRef.current = null;
    };
  }, [peerId, iceServers]);

  const getPeer = useCallback(() => peerRef.current, []);

  return { status, getPeer };
}