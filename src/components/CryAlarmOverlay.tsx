import React from 'react';

interface CryAlarmOverlayProps {
  onDismiss: () => void;
}

export default function CryAlarmOverlay({ onDismiss }: CryAlarmOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(255,40,40,0.85)] animate-alarm-flash cursor-pointer"
      onClick={onDismiss}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold text-white animate-alarm-pulse">
          !
        </div>
        <h2 className="text-[28px] font-bold text-white">Baby is crying!</h2>
        <button
          className="px-12 py-4 text-lg font-semibold bg-white/25 text-white border-2 border-white/50 rounded-radius"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
