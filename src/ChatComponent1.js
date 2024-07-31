import React, { useState, useRef, useEffect } from 'react';

const ChatComponent = () => {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
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

  const handleSendMessage = async () => {
    const endpoint = 'http://localhost:8080/chat';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: inputText })
      });

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
      setPromptHistory([
        ...promptHistory,
        { prompt: inputText, response: messageFromChatGPT }
      ]);
      setInputText('');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTextCompletion = async () => {
    const endpoint = 'http://localhost:8080/text-completion';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: inputText })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const completionText = data.choices[0].text;
      setChatHistory([
        ...chatHistory,
        { sender: 'OxyGPT', message: completionText }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGenerateImage = async () => {
    const endpoint = 'http://localhost:8080/generate-image';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: inputText })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;
      setChatHistory([
        ...chatHistory,
        { sender: 'OxyGPT', message: `Generated Image: ${imageUrl}` }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSpeechToText = async (audioFile) => {
    const endpoint = 'http://localhost:8080/speech-to-text';

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data' // Let the browser set the content type including boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const transcribedText = data.transcription;
      setInputText(transcribedText);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTextToSpeech = async () => {
    const endpoint = 'http://localhost:8080/text-to-speech';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log('Text converted to speech successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePromptClick = (prompt) => {
    setInputText(prompt);
  };

  return (
    <div className="flex">
      <div className="w-1/4 h-full p-4 bg-gray-200 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Prompt History</h2>
        <div className="overflow-y-auto max-h-96">
          {promptHistory.map((prompt, index) => (
            <div
              key={index}
              className="cursor-pointer mb-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
              onClick={() => handlePromptClick(prompt.prompt)}
            >
              <h3 className="text-blue-500 font-bold">{prompt.prompt}</h3>
              <p>{prompt.response}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 chat-container bg-gray-200 rounded-lg p-4">
        <div className="chat-history mb-4">
          {chatHistory.map((entry, index) => (
            <div key={index} className={`message ${entry.sender === 'You' ? 'text-right' : 'text-left'} py-1`}>
              <span className="font-bold">{entry.sender}: </span>
              <span>{entry.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <textarea
          rows="5"
          className="flex-1 border rounded-lg p-2 mr-2 resize-none"
          placeholder="Enter your message (up to 200 words)..."
          value={inputText}
          onChange={handleInputChange}
        />
        <div className="flex mt-4">
          <button onClick={handleSendMessage} className="mr-2 bg-blue-500 text-white py-2 px-4 rounded-lg">
            Send
          </button>
          <button onClick={handleTextCompletion} className="mr-2 bg-green-500 text-white py-2 px-4 rounded-lg">
            Text Completion
          </button>
          <button onClick={handleGenerateImage} className="mr-2 bg-purple-500 text-white py-2 px-4 rounded-lg">
            Generate Image
          </button>
          <button onClick={() => handleSpeechToText(null)} className="mr-2 bg-yellow-500 text-white py-2 px-4 rounded-lg">
            Speech to Text
          </button>
          <button onClick={handleTextToSpeech} className="bg-indigo-500 text-white py-2 px-4 rounded-lg">
            Text to Speech
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
