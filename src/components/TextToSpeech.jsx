import React, { useState } from 'react';

const TextToSpeech = () => {
  const [text, setText] = useState('');

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported.');
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text to speak"
        rows="4"
        cols="50"
      />
      <button onClick={handleSpeak}>Speak</button>
    </div>
  );
};

export default TextToSpeech;
