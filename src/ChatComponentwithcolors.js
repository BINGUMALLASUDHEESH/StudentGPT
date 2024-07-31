import React, { useState, useRef, useEffect } from 'react';

const ChatComponent = () => {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = 'http://localhost:8080/chat'; // Replace with your chat endpoint

    try {
      const response = await fetch(`${endpoint}?message=${encodeURIComponent(inputText)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const messageFromChatGPT = data.choices[0].message.content;
      setChatHistory([
        ...chatHistory,
        { sender: 'You', message: inputText },
        { sender: 'OxyGPT', message: messageFromChatGPT }
      ]);
      setInputText('');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTextCompletion = async () => {
    const endpoint = 'http://localhost:8080/text-completion'; // Replace with your text completion endpoint

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const completionText = data.text; // Adjust this according to your API response structure
      setChatHistory([
        ...chatHistory,
        { sender: 'OxyGPT', message: completionText }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGenerateImage = async () => {
    const endpoint = 'http://localhost:8080/generate-image'; // Replace with your image generation endpoint

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Handle the image response as per your application's requirements
      console.log('Image generated successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSpeechToText = async () => {
    const endpoint = 'http://localhost:8080/speech-to-text'; // Replace with your speech-to-text endpoint

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const transcribedText = data.transcription; // Adjust this according to your API response structure
      setInputText(transcribedText); // Set the transcribed text in the input field
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTextToSpeech = async () => {
    const endpoint = 'http://localhost:8080/text-to-speech'; // Replace with your text-to-speech endpoint

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Handle the text-to-speech response as per your application's requirements
      console.log('Text converted to speech successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="chat-container bg-gray-200 rounded-lg p-4">
      <div className="chat-history mb-4">
        {chatHistory.map((entry, index) => (
          <div key={index} className={`message ${entry.sender === 'You' ? 'text-right' : 'text-left'} py-1`}>
            <span className="font-bold">{entry.sender}: </span>
            <span>{entry.message}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <textarea
          rows="5"
          className="flex-1 border rounded-lg p-2 mr-2 resize-none"
          placeholder="Enter your message (up to 200 words)..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg">
          Send
        </button>
      </form>
      <div className="flex mt-4">
        <button onClick={handleTextCompletion} className="mr-2 bg-green-500 text-white py-2 px-4 rounded-lg">
          Text Completion
        </button>
        <button onClick={handleGenerateImage} className="mr-2 bg-purple-500 text-white py-2 px-4 rounded-lg">
          Generate Image
        </button>
        <button onClick={handleSpeechToText} className="mr-2 bg-yellow-500 text-white py-2 px-4 rounded-lg">
          Speech to Text
        </button>
        <button onClick={handleTextToSpeech} className="bg-indigo-500 text-white py-2 px-4 rounded-lg">
          Text to Speech
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
