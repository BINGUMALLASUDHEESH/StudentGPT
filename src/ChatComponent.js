import React, { useState, useRef, useEffect } from 'react';
import CodeBlock from './components/CodeBlock'; // Adjust the path if needed
import SpinnerButton from './SpinnerButton'
const ChatComponent = () => {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const chatEndRef = useRef(null);
  const [loading,setLoading] = useState(false)

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

    const endpoint = 'https://meta.oxyloans.com/api/auth-service/user/chat';
     
    try {
      setLoading(true)
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
      console.log("Full API response:", data); 

     
      if (data.reply) {
        setChatHistory([
          ...chatHistory,
          { sender: 'You', message: inputText },
          { sender: 'OXYGPT', message: data.reply }
        ]);
        setPromptHistory([
          ...promptHistory,
          { prompt: inputText, response: data.reply }
        ]);
      } else {
        console.error("Unexpected response structure:", data);
        setChatHistory([
          ...chatHistory,
          { sender: 'OXYGPT', message: "No response from API" }
        ]);
      }
      setTimeout(() => {
        setLoading(false)
      }, 2000);

      setInputText('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setChatHistory([
        ...chatHistory,
        { sender: 'OXYGPT', message: `Error: ${error.message}` }
      ]);
      setTimeout(() => {
        setLoading(false)
      }, 2000);
    }
  };

  const handlePromptClick = (prompt) => {
    setChatHistory([
      ...chatHistory,
      { sender: 'You', message: prompt.prompt },
      { sender: 'OXYGPT', message: prompt.response }
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center text-xl font-bold fixed top-0 left-0 w-full z-10">
        OXYGPT DEMO
      </header>
      <div className="flex flex-1 mt-16 mb-16">
        <div className="w-1/4 h-full p-4 bg-gray-200 rounded-lg overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Prompt History</h2>
          <div className="overflow-y-auto max-h-full">
            {promptHistory.map((prompt, index) => (
              <div
                key={index}
                className="cursor-pointer mb-2 p-2 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200"
                onClick={() => handlePromptClick(prompt)}
              >
                <h3 className="text-blue-500 font-bold">{prompt.prompt}</h3>
                <p>{prompt.response}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="chat-history mb-4">
            {chatHistory.map((entry, index) => (
              <div key={index} className={`message ${entry.sender === 'You' ? 'text-right' : 'text-left'} py-1`}>
                <span className="font-bold">{entry.sender}: </span>
                {entry.sender === 'OXYGPT' && entry.message.includes('```') ? (
                  <CodeBlock code={entry.message} language="javascript" /> 
                ) : (
                  <span>{entry.message}</span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex items-center">
            <textarea
              rows="5"
              className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 resize-none"
              placeholder="Enter your message..."
              value={inputText}
              onChange={handleInputChange}
            />
             {!loading?
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg">
          Send
        </button>
        :
        <SpinnerButton loading={loading} text="Send" />
        }
          </form>
        </div>
      </div>
      <footer className="bg-blue-600 text-white p-4 text-center text-sm fixed bottom-0 left-0 w-full">
        Made by BMV.MONEY
      </footer>
    </div>
  );
};

export default ChatComponent;
