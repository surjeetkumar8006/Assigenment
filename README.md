# 🎙️ Voice Assistant (Offline STT + OpenAI + TTS)

This is a voice assistant web app built with **Next.js + TypeScript**. It performs the following tasks:

- Records microphone input
- Transcribes speech **offline** using **Whisper WASM** in a Web Worker
- Sends the transcript to **OpenAI Chat Completion API**
- Displays the reply
- (TTS feature planned) Synthesizes reply to audio offline using local TTS
- (Planned) Performance logging for STT, LLM, and TTS latency

---

## 🧠 Features

| Feature                                                  | Status         |
| -------------------------------------------------------- | -------------- |
| 🎤 Mic Recording via Web Audio API                       | ✅ Done         |
| 🧠 Whisper WASM Transcription (offline)                  | ✅ Done         |
| 💬 OpenAI Chat Completion (reply to transcript)          | ✅ Done         |
| 🔈 Local TTS via Web Worker                              | ❌ Not yet      |
| 🎧 TTS Audio Playback                                    | ❌ Not yet      |
| ⏱️ Performance Logging (STT/LLM/TTS latency tracking)     | ❌ Not yet      |
| 📦 Works offline after first load (except OpenAI calls)  | ✅ Done (PWA)   |

---

## 🚀 Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/surjeetkumar8006/Assigenment

