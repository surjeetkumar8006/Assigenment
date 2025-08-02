// src/workers/whisperWorker.ts
import initWhisper, { Transcriber } from 'whisper-web-transcriber';

let transcriber: Transcriber | null = null;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === "init") {
    if (!transcriber) {
      transcriber = await initWhisper({
        modelUrl: "/models/ggml-tiny.en.bin", // ✅ your file
        onReady: () => {
          self.postMessage({ type: "status", payload: "Whisper ready" });
        },
        onPartialTranscript: (text) => {
          self.postMessage({ type: "transcript", payload: text });
        }
      });
    }
  }

  if (type === "audio-chunk" && transcriber) {
    transcriber.transcribe(payload); // payload is Float32Array
  }

  if (type === "stop" && transcriber) {
    transcriber.finish();
  }
};
