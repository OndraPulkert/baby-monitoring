import React, { useRef, useEffect, useState } from 'react';
import useMediaStream from '../hooks/useMediaStream';
import usePeer from '../hooks/usePeer';
import useBabyConnection from '../hooks/useBabyConnection';
import useWakeLock from '../hooks/useWakeLock';
import useAudioLevel from '../hooks/useAudioLevel';
import { getBabyPeerId } from '../utils/pin-utils';
import StatusIndicator from './StatusIndicator';
import AudioLevelBar from './AudioLevelBar';

interface BabyModeProps {
  pin: string;
  onStop: () => void;
}

export default function BabyMode({ pin, onStop }: BabyModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nightMode, setNightMode] = useState(false);
  const facingMode = nightMode ? 'user' : 'environment';
  const { stream, error } = useMediaStream(true, facingMode);
  const peerId = getBabyPeerId(pin);
  const { status: peerStatus, getPeer } = usePeer(peerId);
  const connectionStatus = useBabyConnection(getPeer, peerStatus, stream);
  const level = useAudioLevel(stream);
  useWakeLock(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const displayStatus = peerStatus !== 'open'
    ? peerStatus
    : connectionStatus;

  return (
    <div className={`flex flex-col h-full ${nightMode ? 'bg-[#1a0f00]' : 'bg-black'}`}>
      <div className="flex items-center justify-between px-4 py-3 z-[1]">
        <StatusIndicator status={displayStatus} />
        <button
          className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-full ${nightMode ? 'bg-[#5c3d00] text-[#ffcc66]' : 'bg-tertiary text-muted'}`}
          onClick={() => setNightMode(!nightMode)}
        >
          {nightMode ? 'Night ON' : 'Night'}
        </button>
        <span className="text-sm text-muted bg-secondary px-3 py-1.5 rounded-full">PIN: {pin}</span>
      </div>

      <div className="mx-4">
        <AudioLevelBar level={level} />
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-danger text-base">
          Camera access denied. Please allow camera and microphone permissions.
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-black"
            autoPlay
            playsInline
            muted
          />
          {nightMode && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,180,80,0.12)_0%,rgba(255,140,40,0.06)_60%,transparent_100%)] pointer-events-none" />
          )}
        </div>
      )}

      <button
        className="p-4 m-4 text-base font-semibold bg-tertiary text-muted rounded-radius"
        onClick={onStop}
      >
        Stop Monitoring
      </button>
    </div>
  );
}
