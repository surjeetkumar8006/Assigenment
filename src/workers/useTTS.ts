const ttsWorker = new Worker(new URL("../workers/ttsWorker.ts", import.meta.url));

ttsWorker.onmessage = (e) => {
  if (e.data.type === "speakRequest") {
    const text = e.data.payload;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
};
