import React, { useRef, useEffect, useCallback, useState } from 'react';
import usePeer from '../hooks/usePeer';
import useTurnCredentials from '../hooks/useTurnCredentials';
import useParentConnection from '../hooks/useParentConnection';
import useWakeLock from '../hooks/useWakeLock';
import useAudioLevel from '../hooks/useAudioLevel';
import useCryAlarm from '../hooks/useCryAlarm';
import { getParentPeerId } from '../utils/pin-utils';
import StatusIndicator from './StatusIndicator';
import AudioLevelBar from './AudioLevelBar';
import CryAlarmOverlay from './CryAlarmOverlay';

interface ParentModeProps {
  pin: string;
  onStop: () => void;
}

export default function ParentMode({ pin, onStop }: ParentModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iceServers = useTurnCredentials();
  const peerId = getParentPeerId(pin);
  const { status: peerStatus, getPeer } = usePeer(peerId, iceServers);
  const { remoteStream, connectionStatus } = useParentConnection(getPeer, peerStatus, pin);
  const level = useAudioLevel(remoteStream);
  const { alarming, dismiss } = useCryAlarm(level, connectionStatus === 'connected');
  const [needsTap, setNeedsTap] = useState(false);
  const [brightBoost, setBrightBoost] = useState(false);
  useWakeLock(true);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Attach remote stream to video
  useEffect(() => {
    if (!remoteStream || !videoRef.current) return;

    videoRef.current.srcObject = remoteStream;
    videoRef.current.play().then(() => {
      setNeedsTap(false);
    }).catch(() => {
      setNeedsTap(true);
    });

    function handleAddTrack() {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }

    remoteStream.addEventListener('addtrack', handleAddTrack);
    return () => remoteStream.removeEventListener('addtrack', handleAddTrack);
  }, [remoteStream]);

  const handleTapToStart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setNeedsTap(false);
      }).catch(() => {});
    }
  }, []);

  // Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator) || connectionStatus !== 'connected') return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: alarming ? 'Baby is crying!' : 'Baby Monitor',
      artist: alarming ? 'Baby Monitor' : 'Listening...',
    });

    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [connectionStatus, alarming]);

  const displayStatus = peerStatus !== 'open'
    ? peerStatus
    : connectionStatus;

  return (
    <div className="relative h-full bg-black">
      <video
        ref={videoRef}
        className={`w-full h-full object-contain bg-black ${brightBoost ? 'brightness-[2.5] contrast-[1.4]' : ''}`}
        autoPlay
        playsInline
      />

      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div className="flex items-center justify-between px-4 py-3 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6),transparent)] pointer-events-auto">
          <StatusIndicator status={displayStatus} />
          <button
            className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-full pointer-events-auto ${brightBoost ? 'bg-[rgba(92,61,0,0.9)] text-[#ffcc66]' : 'bg-[rgba(42,42,42,0.8)] text-muted'}`}
            onClick={() => setBrightBoost(!brightBoost)}
          >
            {brightBoost ? 'Bright ON' : 'Bright'}
          </button>
          <span className="text-sm text-muted bg-[rgba(26,26,26,0.8)] px-3 py-1.5 rounded-full">PIN: {pin}</span>
        </div>

        {connectionStatus === 'connected' && (
          <div className="px-4 pointer-events-none">
            <AudioLevelBar level={level} />
          </div>
        )}

        <div className="flex gap-3 p-4 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent)] pointer-events-auto">
          <button
            className="flex-1 p-4 text-base font-semibold bg-tertiary text-muted rounded-radius"
            onClick={onStop}
          >
            Disconnect
          </button>
        </div>
      </div>

      {needsTap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer" onClick={handleTapToStart}>
          <button
            className="px-12 py-6 text-[22px] font-semibold bg-accent text-white rounded-radius"
            onClick={handleTapToStart}
          >
            Tap to Start
          </button>
        </div>
      )}

      {alarming && <CryAlarmOverlay onDismiss={dismiss} />}
    </div>
  );
}
