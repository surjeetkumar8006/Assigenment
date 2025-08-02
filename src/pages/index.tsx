'use client';

import { useEffect, useRef, useState } from 'react';
import { useMicRecorder } from '../hook/useMicRecorder';

export default function Home() {
  const [status, setStatus] = useState('Idle');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const whisperWorkerRef = useRef<Worker | null>(null);

  const recorder = useMicRecorder((chunk) => {
    whisperWorkerRef.current?.postMessage({ type: 'audio-chunk', payload: chunk });
  });

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/whisperWorker.ts', import.meta.url), // ⚠️ Must be JS, not TS
      { type: 'module' }
    );
    whisperWorkerRef.current = worker;

    worker.onmessage = async (e) => {
      const { type, payload } = e.data;

      if (type === 'status') {
        setStatus(payload);
      }

      if (type === 'transcript') {
        setTranscript((prev) => prev + payload);
      }

      if (type === 'final-transcript') {
        setTranscript(payload);
        setStatus('Querying OpenAI...');
        try {
          const res = await fetch('api/chat.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: payload }),
          });
          const data = await res.json();
          setReply(data.reply);
          setStatus('Reply ready');
        } catch (err) {
          setReply('❌ Error contacting OpenAI');
          setStatus('Error');
        }
      }
    };

    worker.postMessage({ type: 'init' });

    return () => {
      worker.terminate();
    };
  }, []);

  const handleStop = () => {
    recorder.stop();
    whisperWorkerRef.current?.postMessage({ type: 'stop' });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">🎙️ Voice Assistant</h1>
      <p>Status: {status}</p>

      <div className="space-x-2">
        <button onClick={recorder.start} disabled={recorder.isRecording}>⏺️ Start</button>
        <button onClick={handleStop} disabled={!recorder.isRecording}>⏹️ Stop</button>
        <button onClick={recorder.play} disabled={!recorder.hasRecording}>🔊 Play</button>
      </div>

      <div>
        <p className="mt-4 font-medium">📝 Transcript:</p>
        <div className="p-2 border rounded bg-gray-100 whitespace-pre-wrap min-h-[50px]">
          {transcript || '—'}
        </div>
      </div>

      <div>
        <p className="mt-4 font-medium">🤖 Reply:</p>
        <div className="p-2 border rounded bg-green-100 whitespace-pre-wrap min-h-[50px]">
          {reply || '—'}
        </div>
      </div>

      {recorder.audioBlob && (
        <a
          className="inline-block mt-4 text-blue-600 underline"
          href={URL.createObjectURL(recorder.audioBlob)}
          download="recording.wav"
        >
          ⬇️ Download Recording
        </a>
      )}
    </div>
  );
}
