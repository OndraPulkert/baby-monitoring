import { useState, useCallback } from 'react';
import PinEntry from './components/PinEntry';
import BabyMode from './components/BabyMode';
import ParentMode from './components/ParentMode';

type Screen = 'pin-entry' | 'baby-mode' | 'parent-mode';

export default function App() {
  const [screen, setScreen] = useState<Screen>('pin-entry');
  const [pin, setPin] = useState('');

  const handleStart = useCallback((enteredPin: string, role: 'baby' | 'parent') => {
    setPin(enteredPin);
    setScreen(role === 'baby' ? 'baby-mode' : 'parent-mode');
  }, []);

  const handleStop = useCallback(() => {
    setPin('');
    setScreen('pin-entry');
  }, []);

  return (
    <div className="h-full w-full">
      {screen === 'pin-entry' && <PinEntry onStart={handleStart} />}
      {screen === 'baby-mode' && <BabyMode pin={pin} onStop={handleStop} />}
      {screen === 'parent-mode' && <ParentMode pin={pin} onStop={handleStop} />}
    </div>
  );
}
