// components/VoiceSearchDialog.jsx
// The voice search pop-up (like the Flipkart / Amazon apps):
//   "Listening... speak now" -> your words appear -> "Searching for ..." -> results page.
// If something goes wrong it says why, with "Try again" and "Type instead" buttons.
// Built on the browser's <dialog> element, which already handles focus and the Escape key.

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, MicIcon } from './Icons.jsx';
import useVoiceSearch from '../hooks/useVoiceSearch.js';
import '../styles/voice-search.css';

// How long "Searching for ..." stays on screen before the results page opens
const SHOW_RESULT_MS = 700;

function VoiceSearchDialog({ onResult, onClose, onTypeInstead }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const [resultText, setResultText] = useState('');

  const voice = useVoiceSearch({
    onFinalText(text) {
      setResultText(text); // show "Searching for ..." for a moment, then search
    },
  });

  // Open the pop-up and start listening straight away.
  // The tiny timer makes sure the mic starts only ONCE: in development React runs this
  // effect twice on purpose, and the cleanup cancels the first timer.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const timer = setTimeout(() => voice.start(), 0);
    return () => clearTimeout(timer);
  }, []);

  // After showing the words for a moment, run the search (the parent opens the results page)
  useEffect(() => {
    if (!resultText) return undefined;
    const timer = setTimeout(() => {
      dialogRef.current?.close();
      onResult(resultText);
    }, SHOW_RESULT_MS);
    return () => clearTimeout(timer);
  }, [resultText]);

  // dialog.close() fires the "close" event, and onClose then removes the pop-up
  function closeDialog() {
    voice.cancel();
    dialogRef.current?.close();
  }

  function handleDialogClick(event) {
    // A click on the dark background lands on the <dialog> itself
    if (event.target === event.currentTarget) closeDialog();
  }

  function tryAgain() {
    setResultText('');
    voice.start();
  }

  // Big mic: while listening it stops (and searches what was heard); after an error it tries again
  function handleMicClick() {
    if (voice.status === 'error' || voice.status === 'idle') tryAgain();
    else voice.stop();
  }

  // "Type instead": close the pop-up and put the cursor in the search box
  function typeInstead() {
    closeDialog();
    onTypeInstead();
  }

  // The heading and the small text under the mic for each step
  let heading = '';
  let hint = '';
  if (resultText) {
    heading = 'Searching for';
  } else if (voice.status === 'starting') {
    heading = 'Starting the microphone...';
    hint = 'If your browser asks, click "Allow" to use the microphone.';
  } else if (voice.status === 'listening') {
    heading = voice.liveText ? 'Listening...' : 'Listening... speak now';
  } else if (voice.status === 'processing') {
    heading = 'Understanding what you said...';
    if (voice.isSlow) hint = 'This is taking longer than usual. Your internet connection may be slow.';
  } else if (voice.status === 'error') {
    heading = "Voice search didn't work";
  }

  const shownText = resultText || voice.liveText;

  // createPortal puts the pop-up at the end of <body>, outside the navbar
  return createPortal(
    <dialog
      ref={dialogRef}
      className="voice-dialog"
      onClose={onClose}
      onClick={handleDialogClick}
      aria-labelledby={titleId}
    >
      <div className="voice-dialog-inner">
        <button type="button" className="voice-dialog-close" onClick={closeDialog} aria-label="Close voice search">
          <CloseIcon size={20} />
        </button>

        <h2 id={titleId} className="voice-heading" aria-live="polite">
          {heading}
        </h2>

        {/* The words heard so far (big), or examples of what to say */}
        {shownText ? (
          <p className={`voice-text ${resultText ? 'is-final' : ''}`} aria-live="polite">
            "{shownText}"
          </p>
        ) : (
          voice.status === 'listening' && (
            <p className="voice-examples">Try saying "bamboo basket", "dokra art" or "tribal jewellery"</p>
          )
        )}

        <button
          type="button"
          className={`voice-mic voice-mic-${resultText ? 'done' : voice.status}`}
          onClick={handleMicClick}
          disabled={Boolean(resultText) || voice.status === 'processing'}
          aria-label={voice.status === 'error' ? 'Try again' : 'Stop listening and search'}
        >
          <MicIcon size={36} />
        </button>

        {hint && <p className="voice-hint">{hint}</p>}

        {voice.status === 'error' && !resultText && (
          <div className="voice-error" role="alert">
            <p>{voice.errorMessage}</p>
            <div className="voice-error-actions">
              <button type="button" className="btn btn-primary" onClick={tryAgain}>
                <MicIcon size={18} /> Try again
              </button>
              <button type="button" className="btn btn-outline" onClick={typeInstead}>
                Type instead
              </button>
            </div>
          </div>
        )}

        {voice.status === 'listening' && !shownText && (
          <p className="voice-tip">Tap the mic when you finish, or just stop speaking.</p>
        )}
      </div>
    </dialog>,
    document.body
  );
}

export default VoiceSearchDialog;
