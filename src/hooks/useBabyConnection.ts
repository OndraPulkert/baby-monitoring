import { useEffect, useState, useRef } from 'react';
import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';

export default function useBabyConnection(
  getPeer: () => Peer | null,
  peerStatus: string,
  stream: MediaStream | null
) {
  const [connectionStatus, setConnectionStatus] = useState('waiting');
  const callRef = useRef<MediaConnection | null>(null);

  // Handle incoming calls
  useEffect(() => {
    const peer = getPeer();
    if (!peer || peerStatus !== 'open' || !stream) return;

    function handleCall(call: MediaConnection) {
      callRef.current = call;
      call.answer(stream!);
      setConnectionStatus('connected');

      // Monitor ICE connection state
      const pc = call.peerConnection;
      if (pc) {
        const onIceStateChange = () => {
          const state = pc.iceConnectionState;
          if (state === 'failed') {
            call.close();
            setConnectionStatus('waiting');
            callRef.current = null;
          }
          // For 'disconnected', just wait — parent will re-call
        };
        pc.addEventListener('iceconnectionstatechange', onIceStateChange);
        call.on('close', () => {
          pc.removeEventListener('iceconnectionstatechange', onIceStateChange);
        });
      }

      call.on('close', () => {
        setConnectionStatus('waiting');
        callRef.current = null;
      });

      call.on('error', () => {
        setConnectionStatus('waiting');
        callRef.current = null;
      });
    }

    peer.on('call', handleCall);

    return () => {
      peer.off('call', handleCall);
    };
  }, [getPeer, peerStatus, stream]);

  // Replace tracks when stream changes (e.g. camera switch)
  // without dropping the connection
  useEffect(() => {
    const call = callRef.current;
    if (!call || !stream) return;

    try {
      const pc = call.peerConnection;
      if (!pc) return;

      const senders = pc.getSenders();
      stream.getTracks().forEach((newTrack) => {
        const sender = senders.find(
          (s) => s.track && s.track.kind === newTrack.kind
        );
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      });
    } catch (e) {
      // replaceTrack not supported or connection closed
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.close();
        callRef.current = null;
      }
    };
  }, []);

  return connectionStatus;
}
