import { useEffect, useState } from 'react';

export default function useAudioLevel(stream: MediaStream | null) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const intervalId = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      setLevel(sum / dataArray.length / 255);
    }, 100);

    return () => {
      clearInterval(intervalId);
      source.disconnect();
      audioContext.close().catch(() => {});
    };
  }, [stream]);

  return level;
}
