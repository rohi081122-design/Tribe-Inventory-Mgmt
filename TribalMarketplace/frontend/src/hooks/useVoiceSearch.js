// hooks/useVoiceSearch.js
// Voice search with the browser's own speech recognition (Web Speech API).
// No API key or library is needed. Chrome, Edge, Safari and Android phones support it.
// IMPORTANT: Chrome and Edge send the voice to Google / Microsoft to turn it into text,
// so voice search needs a working internet connection.
//
// Usage (see components/VoiceSearchDialog.jsx):
//   const voice = useVoiceSearch({ onFinalText: (text) => ... });
//   voice.start()  -> starts listening (the browser asks for mic permission the first time)
//   voice.stop()   -> stops listening and uses what was heard so far
//   voice.cancel() -> stops listening and throws the words away
//   voice.status   -> 'idle' | 'starting' | 'listening' | 'processing' | 'error'
//   voice.liveText -> the words heard so far (shown while the person speaks)
//   voice.errorMessage, voice.isSlow (true when turning voice into text takes long)

import { useEffect, useRef, useState } from 'react';

// Indian English first (understands Indian accents and words like "dokra" better).
// If a browser does not know Indian English, we try again with US English.
const LANGUAGES = ['en-IN', 'en-US'];

// After the person stops speaking: show the "slow internet" hint after this many milliseconds
const SLOW_AFTER_MS = 4000;

// Chrome, Edge and Safari still use the "webkit" name
function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// Show the mic button only in browsers that have speech recognition (Firefox does not)
export function isVoiceSearchSupported() {
  return Boolean(getSpeechRecognition());
}

// Speech results sometimes end with a full stop ("Bamboo basket.") - remove it
export function cleanSpokenText(text) {
  return text
    .replace(/[.,!?।]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Problems we can see BEFORE listening (returns a message, or '' when everything is fine)
function findSetupProblem() {
  if (!getSpeechRecognition()) {
    return 'Voice search does not work in this browser. Please use Google Chrome or Microsoft Edge, or type your search.';
  }
  // Brave has the speech feature but blocks Google's speech service, so it always fails
  if (navigator.brave) {
    return 'The Brave browser does not allow voice search. Please open this website in Google Chrome or Microsoft Edge, or type your search.';
  }
  // Browsers only allow the microphone on https:// addresses and on localhost
  if (!window.isSecureContext) {
    return 'Voice search needs a secure (https://) address. On this computer, open the website at http://localhost:5173 instead.';
  }
  if (navigator.onLine === false) {
    return 'You are offline. Voice search needs the internet to turn your voice into text. Please connect and try again.';
  }
  return '';
}

// Friendly messages for the error codes of the Web Speech API
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'The microphone is blocked for this website. Click the lock (or mic) icon next to the address bar, set Microphone to Allow, then tap Try again.';
    case 'no-speech':
      return 'We did not hear anything. Make sure your microphone is on, then speak a little louder and closer to it.';
    case 'audio-capture':
      return 'No microphone was found. Connect a microphone, or check Windows Settings > Privacy & security > Microphone.';
    case 'network':
      return 'Could not reach the voice service. Your internet seems slow or disconnected. Voice search needs the internet (your browser sends the voice to Google / Microsoft to turn it into text). Please check your connection and try again.';
    default:
      return 'Voice search did not work. Please try again, or type your search.';
  }
}

function useVoiceSearch({ onFinalText }) {
  const [status, setStatus] = useState('idle');
  const [liveText, setLiveText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSlow, setIsSlow] = useState(false);
  const recognitionRef = useRef(null);
  const cancelledRef = useRef(false);

  // Always call the newest callback (it changes on every render)
  const onFinalTextRef = useRef(onFinalText);
  useEffect(() => {
    onFinalTextRef.current = onFinalText;
  });

  function fail(message) {
    setStatus('error');
    setErrorMessage(message);
  }

  // languageIndex: which entry of LANGUAGES to use (1 = the US English retry)
  function start(languageIndex = 0) {
    if (recognitionRef.current) return; // already listening

    setLiveText('');
    setErrorMessage('');
    setIsSlow(false);

    const problem = findSetupProblem();
    if (problem) {
      fail(problem);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGES[languageIndex];
    recognition.interimResults = true; // show the words while the person is still speaking
    recognition.continuous = false; // stop by itself after a short pause
    recognition.maxAlternatives = 1;

    let heardText = '';
    let errorCode = '';
    let slowTimer = null;
    cancelledRef.current = false;
    setStatus('starting');

    // The microphone is really on now
    recognition.onaudiostart = () => setStatus('listening');

    recognition.onresult = (event) => {
      // Join every piece heard so far ("bamboo" + "basket")
      heardText = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ');
      setLiveText(cleanSpokenText(heardText));
    };

    // The person stopped talking: the browser is now turning the voice into text (online)
    recognition.onspeechend = () => {
      setStatus('processing');
      slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    };

    recognition.onerror = (event) => {
      errorCode = event.error;
    };

    // Listening has finished: because of a pause, stop(), cancel() or an error
    recognition.onend = () => {
      clearTimeout(slowTimer);
      recognitionRef.current = null;
      setIsSlow(false);

      if (cancelledRef.current || errorCode === 'aborted') {
        setStatus('idle');
        return;
      }

      // We heard some words: search for them (even if the connection broke at the very end)
      const text = cleanSpokenText(heardText);
      if (text) {
        setStatus('idle');
        onFinalTextRef.current?.(text);
        return;
      }

      // This browser does not know Indian English: try once more with US English
      if (errorCode === 'language-not-supported' && languageIndex + 1 < LANGUAGES.length) {
        start(languageIndex + 1);
        return;
      }

      fail(errorCode ? getErrorMessage(errorCode) : 'Sorry, we could not catch that. Please tap Try again and speak clearly.');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      fail(getErrorMessage(''));
    }
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  function cancel() {
    if (!recognitionRef.current) return;
    cancelledRef.current = true;
    recognitionRef.current.abort();
  }

  // Turn the microphone off when the pop-up closes
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (!recognition) return;
      recognition.onaudiostart = null;
      recognition.onresult = null;
      recognition.onspeechend = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  return { status, liveText, errorMessage, isSlow, start, stop, cancel };
}

export default useVoiceSearch;
