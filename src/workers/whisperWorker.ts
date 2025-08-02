// src/workers/whisperWorker.ts

import { createWhisper } from 'whisper-web-transcriber';

let transcriber: Awaited<ReturnType<typeof createWhisper>> | null = null;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'init') {
    if (!transcriber) {
      transcriber = await createWhisper({
        modelUrl: '/models/ggml-tiny.en.bin',
        onReady: () => {
          self.postMessage({ type: 'status', payload: 'Whisper ready ✅' });
        },
        onPartialTranscript: (text: string) => {
          self.postMessage({ type: 'transcript', payload: text });
        },
        onFinalTranscript: (text: string) => {
          self.postMessage({ type: 'final-transcript', payload: text });
        },
      });
    }
  }

  if (type === 'audio-chunk' && transcriber) {
    transcriber.transcribe(payload as Float32Array);
  }

  if (type === 'stop' && transcriber) {
    transcriber.finish();
  }
};

export default null as any;
