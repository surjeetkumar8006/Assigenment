importScripts("https://cdn.jsdelivr.net/npm/whisper-web-transcriber@latest/dist/index.js");

let transcriber = null;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === "init") {
    if (!transcriber) {
      transcriber = await window.whisperWebTranscriber.initWhisper({
        modelUrl: "/models/whisper-tiny.bin",
        onReady: () => {
          self.postMessage({ type: "status", payload: "Whisper ready" });
        },
        onPartialTranscript: (text) => {
          self.postMessage({ type: "transcript", payload: text });
        },
      });
    }
  }

  if (type === "audio-chunk" && transcriber) {
    transcriber.transcribe(payload);
  }

  if (type === "stop" && transcriber) {
    transcriber.finish();
  }
};
