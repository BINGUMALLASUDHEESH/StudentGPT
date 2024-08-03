import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faPaperPlane,
  faSignOutAlt,
  faClipboard,
  faVolumeUp,
  faStop,
  faCheck,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FaMicrophoneSlash, FaMicrophoneAlt } from "react-icons/fa";
import sideicon from "../assets/profile-user.png";
import gpticon from "../assets/artificial-intelligence.png";
import axios from "axios";
import { Link } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

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

  const fetchApiResponse = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching API response:", error);
      return "Error: Unable to get response";
    }
  }; 

  const handleSend = async (e, text) => {
    e.preventDefault();
    const messageText = text || inputValue
    if (!messageText.trim()) return;

    const newMessages = [
      ...(messages[activeTab] || []),
      { sender: "user", text: messageText },
    ];
    setMessages({ ...messages, [activeTab]: newMessages });
    setInputValue("");

    let result;
    if (
      messageText.toLowerCase().includes("image") ||
      messageText.toLowerCase().includes("images") ||
      messageText.toLowerCase().includes("photo") ||
      messageText.toLowerCase().includes("photos")
    ) {
      const cleanedPrompt = messageText
        .toLowerCase()
        .replace(/i want/g, "")
        .replace(/images?/g, "")
        .replace(/photos?/g, "")
        .trim();

      const imageUrl = await fetchApiResponse(
        `http://182.18.139.138:9001/api/student-service/user/image?prompt=${cleanedPrompt}`
      );

      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeTab]: [
          ...prevMessages[activeTab],
          { sender: "bot", imageUrl },
        ],
      }));
    } else {
      result = await fetchApiResponse(
        `http://182.18.139.138:9001/api/student-service/user/v1/assistants?ContentType=${messageText}`
      );
      const responce=JSON.stringify(result)
      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeTab]: [
          ...prevMessages[activeTab],
          { sender: "bot", text:responce },
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

  const handleVoiceClick = async () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);

      // Send the transcript as a message
      const newMessages = [
        ...(messages[activeTab] || []),
        { sender: "user", text: transcript },
      ];
      console.log(transcript);
      setMessages({ ...messages, [activeTab]: newMessages });

      try {
        const response = await axios.get(
          `http://182.18.139.138:9001/api/student-service/user/v1/assistants?ContentType=${transcript}`
        );

        console.log("Transcript:", transcript);
        console.log("Response from API:", response.data);

        setMessages((prevMessages) => ({
          ...prevMessages,
          [activeTab]: [
            ...prevMessages[activeTab],
            { sender: "bot", text: response.data },
          ],
        }));
      } catch (error) {
        console.error("Error sending transcript:", error);
      }

      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        setMessages((prevMessages) => ({
          ...prevMessages,
          [activeTab]: [
            ...prevMessages[activeTab],
            { sender: "user", imageUrl },
          ],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatText = (text) => {
    return text.replace(/\n\n/g, '<br/><br/>');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-200 text-black flex flex-col p-4">
        <div className="flex items-center justify-center mb-4">
          <img
            src={gpticon}
            alt="GPT Icon"
            width={40}
            height={40}
            className="mr-2"
          />
          <b className="text-lg">Student GPT</b>
        </div>
        <button
          onClick={addNewTab}
          className="p-2 mb-4 flex items-center justify-center bg-gray-300 hover:bg-gray-200 rounded"
        >
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          Create New
        </button>
        <div className="flex-grow overflow-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center p-3 cursor-pointer rounded ${
                activeTab === tab.id ? "bg-blue-200" : "bg-gray-300"
              } hover:bg-blue-200 mb-2`}
            >
              <img
                src={sideicon}
                alt="User Icon"
                width={30}
                height={30}
                className="mr-2"
              />
              {tab.name}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            to="/"
            className="flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="ml-2">Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border-r-2 border-l-2 border-gray-300 mx-auto max-w-3xl">
        <div className="flex-grow p-4 overflow-auto">
          {(messages[activeTab] || []).map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`rounded-md p-3 ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                } max-w-md relative`}
              >
                {message.imageUrl ? (
                  <img
                    src={message.imageUrl}
                    alt="Generated Content"
                    className="max-w-full h-auto"
                  />
                ) : (
                  <div className="flex flex-col items-start">
                    <div>{formatText(message.text)}</div>
                    {message.sender !== "user" && (
                      <div className="flex space-x-2 absolute bottom-1 right-1">
                        <button
                          className={`${
                            copiedTextId === index ? "text-green-600" : ""
                          }`}
                          onClick={() => handleCopy(message.text, index)}
                        >
                          <FontAwesomeIcon
                            icon={copiedTextId === index ? faCheck : faClipboard}
                          />
                        </button>
                        <button onClick={() => handlePlayPause(message.text)}>
                          <FontAwesomeIcon
                            icon={isPlaying ? faStop : faVolumeUp}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 flex items-center border-t-2 border-gray-300">
          <input
            type="text"
            value={isListening ? transcript : inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow bg-gray-200 p-2 rounded outline-none mr-2"
          />
          <button
            className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md mr-2"
            onClick={handleVoiceClick}
          >
            <FontAwesomeIcon
              icon={isListening ? FaMicrophoneSlash : FaMicrophoneAlt}
            />
          </button>
          <button
            className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
            onClick={handleSend}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
          <label
            htmlFor="file-input"
            className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md ml-2 cursor-pointer"
          >
            <FontAwesomeIcon icon={faUpload} />
          </label>
          <input
            type="file"
            id="file-input"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard2;
