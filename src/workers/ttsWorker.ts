self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'speak') {
    const utterance = new SpeechSynthesisUtterance(payload);
    speechSynthesis.speak(utterance);
    utterance.onend = () => {
      self.postMessage({ type: 'done' });
    };
  }
};

export default null as any;

