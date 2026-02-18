import { useEffect, useState, useRef, useCallback } from 'react';
import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { getBabyPeerId } from '../utils/pin-utils';

function createDummyStream() {
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const dest = audioCtx.createMediaStreamDestination();
  oscillator.connect(dest);
  oscillator.start();

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx2d = canvas.getContext('2d')!;
  ctx2d.fillRect(0, 0, 320, 240);
  const canvasStream = canvas.captureStream(15);

  const stream = new MediaStream();
  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  canvasStream.getVideoTracks().forEach((t) => stream.addTrack(t));

  return {
    stream,
    cleanup: () => {
      audioCtx.close().catch(() => {});
      canvasStream.getVideoTracks().forEach((t) => t.stop());
    },
  };
}

export default function useParentConnection(
  getPeer: () => Peer | null,
  peerStatus: string,
  pin: string
) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('calling');
  const callRef = useRef<MediaConnection | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const call = useCallback(() => {
    const peer = getPeer();
    if (!peer || peer.destroyed) return;

    if (callRef.current) callRef.current.close();
    if (cleanupRef.current) cleanupRef.current();

    setConnectionStatus('calling');

    const { stream, cleanup } = createDummyStream();
    cleanupRef.current = cleanup;

    const mediaConnection = peer.call(getBabyPeerId(pin), stream);
    if (!mediaConnection) {
      cleanup();
      cleanupRef.current = null;
      return;
    }

    callRef.current = mediaConnection;

    mediaConnection.on('stream', (s) => {
      setRemoteStream(s);
      setConnectionStatus('connected');

      // Monitor ICE connection state for robust reconnect
      const pc = mediaConnection.peerConnection;
      if (pc) {
        let disconnectTimer: ReturnType<typeof setTimeout> | null = null;
        const onIceStateChange = () => {
          const state = pc.iceConnectionState;
          if (state === 'failed') {
            if (disconnectTimer) clearTimeout(disconnectTimer);
            mediaConnection.close();
            setRemoteStream(null);
            setConnectionStatus('calling');
          } else if (state === 'disconnected') {
            disconnectTimer = setTimeout(() => {
              if (pc.iceConnectionState === 'disconnected') {
                mediaConnection.close();
                setRemoteStream(null);
                setConnectionStatus('calling');
              }
            }, 5000);
          } else if (state === 'connected' || state === 'completed') {
            if (disconnectTimer) {
              clearTimeout(disconnectTimer);
              disconnectTimer = null;
            }
          }
        };
        pc.addEventListener('iceconnectionstatechange', onIceStateChange);
        mediaConnection.on('close', () => {
          pc.removeEventListener('iceconnectionstatechange', onIceStateChange);
          if (disconnectTimer) clearTimeout(disconnectTimer);
        });
      }
    });

    mediaConnection.on('close', () => {
      setRemoteStream(null);
      setConnectionStatus('calling');
    });

    mediaConnection.on('error', () => {
      setRemoteStream(null);
      setConnectionStatus('calling');
    });
  }, [getPeer, pin]);

  useEffect(() => {
    if (peerStatus === 'open') call();
    return () => {
      if (callRef.current) callRef.current.close();
      if (cleanupRef.current) cleanupRef.current();
      callRef.current = null;
      cleanupRef.current = null;
    };
  }, [peerStatus, call]);

  useEffect(() => {
    if (connectionStatus === 'calling') {
      retryRef.current = setTimeout(call, 3000);
    }
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connectionStatus, call]);

  return { remoteStream, connectionStatus };
}
