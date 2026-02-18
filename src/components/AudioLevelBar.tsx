import React from 'react';

interface AudioLevelBarProps {
  level: number;
}

export default function AudioLevelBar({ level }: AudioLevelBarProps) {
  const percent = Math.min(level * 100, 100);
  const color =
    percent > 60 ? '#ff4a4a' : percent > 30 ? '#ffaa4a' : '#4aff7a';

  return (
    <div className="w-full h-1.5 bg-tertiary rounded-[3px] overflow-hidden">
      <div
        className="h-full rounded-[3px] [transition:width_0.1s_ease-out,background-color_0.3s]"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}
