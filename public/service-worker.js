self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('voice-models').then(cache =>
      cache.addAll([
        '/models/whisper-wasm.bin',
        '/models/tts-model.onnx',
      ])
    )
  );
});
