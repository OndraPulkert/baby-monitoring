import React from 'react';

interface StatusInfo {
  label: string;
  color: string;
}

const STATUS_MAP: Record<string, StatusInfo> = {
  connecting: { label: 'Connecting...', color: '#ffaa4a' },
  open: { label: 'Ready', color: '#4a9eff' },
  waiting: { label: 'Waiting...', color: '#ffaa4a' },
  calling: { label: 'Calling...', color: '#ffaa4a' },
  connected: { label: 'Connected', color: '#4aff7a' },
  disconnected: { label: 'Disconnected', color: '#ff4a4a' },
  error: { label: 'Error', color: '#ff4a4a' },
  closed: { label: 'Closed', color: '#ff4a4a' },
};

interface StatusIndicatorProps {
  status: string;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const info = STATUS_MAP[status] || { label: status, color: '#999999' };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-muted">
      <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: info.color }} />
      <span>{info.label}</span>
    </div>
  );
}
