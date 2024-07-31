import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faPaperPlane,
  faSignOutAlt,
  faClipboard,
  faVolumeUp,
  faMicrophone,
  faStop,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Link } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function Dashboard2() {
  const [tabs, setTabs] = useState([{ id: 1, name: "Chat 1" }]);
  const [activeTab, setActiveTab] = useState(1);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const { transcript, resetTranscript } = useSpeechRecognition();

  const addNewTab = () => {
    const newTabId = tabs.length + 1;
    setTabs([...tabs, { id: newTabId, name: `Chat ${newTabId}` }]);
    setActiveTab(newTabId);
    setMessages({ ...messages, [newTabId]: [] });
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [
      ...(messages[activeTab] || []),
      { sender: "user", text: inputValue },
    ];
    setMessages({ ...messages, [activeTab]: newMessages });
    setInputValue("");

    try {
      if (
        inputValue.toLowerCase().includes("image") ||
        inputValue.toLowerCase().includes("images") ||
        inputValue.toLowerCase().includes("photo") ||
        inputValue.toLowerCase().includes("photos")
      ) {
        const cleanedPrompt = inputValue
          .toLowerCase()
          .replace(/i want/g, "")
          .replace(/images?/g, "")
          .replace(/photos?/g, "")
          .trim();

        const response = await axios.get(
          `http://182.18.139.138:9001/api/student-service/user/image?prompt=${cleanedPrompt}`
        );

        const imageUrl = response.data;
        setMessages((prevMessages) => ({
          ...prevMessages,
          [activeTab]: [
            ...prevMessages[activeTab],
            { sender: "bot", imageUrl },
          ],
        }));
      } else {
        const response = await axios.get(
          `http://182.18.139.138:9001/api/student-service/user/v1/assistants?ContentType=${inputValue}`
        );

        const result = response.data;
        setMessages((prevMessages) => ({
          ...prevMessages,
          [activeTab]: [
            ...prevMessages[activeTab],
            { sender: "bot", text: result },
          ],
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeTab]: [
          ...prevMessages[activeTab],
          { sender: "bot", text: "Error: Unable to get response" },
        ],
      }));
    }
  };

  const handleCopy = (text, messageIndex) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedTextId(messageIndex);
        setTimeout(() => setCopiedTextId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported.");
    }
  };

  const handlePlayPause = (text) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakText(text);
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      setInputValue(transcript);
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-800 text-white flex flex-col">
        <button
          onClick={addNewTab}
          className="p-4 flex items-center justify-center bg-gray-700 hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faComments} className="ml-2" />
          <span className="ml-2">NEW CHAT</span>
        </button>
        <div className="flex-grow overflow-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`p-4 cursor-pointer ${
                activeTab === tab.id ? "bg-gray-600" : "bg-gray-700"
              } hover:bg-gray-600`}
            >
              {tab.name}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-600">
          <Link
            to="/"
            className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="ml-2">Log Out</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-5/6 flex flex-col">
        <div className="flex-grow p-4 overflow-auto bg-gray-100">
          {messages[activeTab]?.map((msg, index) => (
            <div
              key={index}
              className={`relative p-4 mb-4 rounded ${
                msg.sender === "user" ? "bg-blue-200" : "bg-green-200"
              }`}
            >
              {msg.sender === "user" ? (
                <>
                  <strong>You:</strong> {msg.text}
                </>
              ) : msg.imageUrl ? (
                <img
                  src={msg.imageUrl}
                  alt="Generated"
                  className="w-full max-w-xs"
                />
              ) : (
                msg.text
              )}
              {/* Copy and Audio Buttons */}
              <div className="absolute right-2 bottom-2 flex space-x-2">
                <button onClick={() => handleCopy(msg.text, index)}>
                  <FontAwesomeIcon
                    icon={copiedTextId === index ? faCheck : faClipboard}
                  />
                </button>
                <button onClick={() => handlePlayPause(msg.text)}>
                  <FontAwesomeIcon icon={isPlaying ? faStop : faVolumeUp} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex p-4 border-t border-gray-300">
        <button
            type="button"
            onClick={handleVoiceClick}
            className={`mr-2 p-2 rounded-md ${
              isListening ? "bg-red-500" : "bg-gray-700"
            }`} 
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-md hover:bg-blue-600"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
          
        </form>
        <div className="p-4 text-sm text-gray-600">
          <span className="font-bold text-lg text-gray-800">Tip:</span>
          <span className="italic text-gray-700">
            To generate an image, type your prompt followed by
          </span>
          <span className="font-semibold text-blue-600"> "image"</span>
          <span className="italic text-gray-700"> (e.g.,</span>
          <span className="font-semibold text-blue-600">
            "Oxford University image"
          </span>
          <span className="italic text-gray-700">).</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard2;
