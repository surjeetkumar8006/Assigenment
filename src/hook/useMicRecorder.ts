import { useRef, useState } from "react";

export function useMicRecorder(onData?: (chunk: Float32Array) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();
    audioContextRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(2048, 1, 1);

    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const chunk = new Float32Array(input);
      onData?.(chunk);
      audioChunksRef.current.push(chunk);
    };

    sourceRef.current = source;
    processorRef.current = processor;

    setIsRecording(true);
    setHasRecording(false);
    setAudioBlob(null);
  };

  const stop = async () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const flat = Float32Array.from(audioChunksRef.current.flat());
    const buffer = audioCtx.createBuffer(1, flat.length, audioCtx.sampleRate);
    buffer.copyToChannel(flat, 0);
    audioBufferRef.current = buffer;

    const wavBlob = encodeWAV(flat, audioCtx.sampleRate);
    setAudioBlob(wavBlob);

    await audioCtx.close();
    audioContextRef.current = null;

    setIsRecording(false);
    setHasRecording(true);
  };

  const play = () => {
    const buffer = audioBufferRef.current;
    if (!buffer) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  return { start, stop, play, isRecording, hasRecording, audioBlob };
}

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: "audio/wav" });
}
