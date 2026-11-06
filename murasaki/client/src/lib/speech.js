import { useEffect, useState } from 'react';

// Pronunciation through the browser's built-in speech synthesis.
// Nothing is downloaded; if the device has no Japanese voice the
// "Listen" button simply doesn't appear.

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function japaneseVoice() {
  if (!supported) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'ja-JP') ?? voices.find((v) => v.lang?.startsWith('ja')) ?? null;
}

/** True once a Japanese voice is available on this device. */
export function useJapaneseVoice() {
  const [available, setAvailable] = useState(() => Boolean(japaneseVoice()));
  useEffect(() => {
    if (!supported) return undefined;
    const update = () => setAvailable(Boolean(japaneseVoice()));
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return available;
}

/** Read Japanese text aloud. */
export function speak(text) {
  if (!supported || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  const voice = japaneseVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
