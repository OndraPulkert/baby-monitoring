import React, { useState } from 'react';
import { isValidPin } from '../utils/pin-utils';

interface PinEntryProps {
  onStart: (pin: string, role: 'baby' | 'parent') => void;
}

const btnBase =
  'flex-1 py-5 px-4 text-xl font-semibold rounded-radius flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed';

export default function PinEntry({ onStart }: PinEntryProps) {
  const [pin, setPin] = useState('');

  const valid = isValidPin(pin);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-5">
      <h1 className="text-[28px] font-bold text-light">Baby Monitor</h1>
      <p className="text-sm text-muted text-center">Enter the same PIN on both devices</p>

      <input
        className="w-[200px] p-4 text-[32px] text-center tracking-[8px] bg-secondary border-2 border-tertiary rounded-radius text-light outline-none transition-colors duration-200 focus:border-accent"
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="PIN (4-6 digits)"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        autoFocus
      />

      <div className="flex gap-4 w-full max-w-[400px] mt-3">
        <button
          className={`${btnBase} bg-accent text-white`}
          disabled={!valid}
          onClick={() => onStart(pin, 'baby')}
        >
          Baby
          <span className="text-[11px] font-normal opacity-80">Camera &amp; mic near baby</span>
        </button>
        <button
          className={`${btnBase} bg-success text-primary`}
          disabled={!valid}
          onClick={() => onStart(pin, 'parent')}
        >
          Parent
          <span className="text-[11px] font-normal opacity-80">Watch &amp; listen</span>
        </button>
      </div>
    </div>
  );
}
