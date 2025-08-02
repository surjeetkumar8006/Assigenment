import { useEffect, useRef, useState } from 'react';

export function useWhisper() {
  const workerRef = useRef<Worker>();
  const [status, setStatus] = useState("Idle");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/whisperWorker.ts', import.meta.url),
      { type: 'module' }
    );

    const worker = workerRef.current;

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'status') setStatus(payload);
      if (type === 'transcript') setTranscript((prev) => prev + payload);
      if (type === 'error') console.error('Whisper Worker Error:', payload);
    };

    worker.postMessage({ type: 'init' });

    return () => {
      worker.terminate();
    };
  }, []);

  const sendAudioChunk = (chunk: Float32Array) => {
    workerRef.current?.postMessage({ type: 'audio-chunk', payload: chunk });
  };

  const stop = () => {
    workerRef.current?.postMessage({ type: 'stop' });
  };

  return { status, transcript, sendAudioChunk, stop };
}
