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
  faUserCircle,
  faRedo,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { FaMicrophoneSlash, FaMicrophoneAlt, FaRegEdit } from "react-icons/fa";
import { RiOpenaiFill } from "react-icons/ri"
import sideicon from "../assets/profile-user.png";
import gpticon from "../assets/artificial-intelligence.png";
import axios from "axios";
import { Link } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { marked } from "marked";

function ChatGPTDashboard() {
  const [tabs, setTabs] = useState([{ id: 1, name: "Conversation-1" }]);
  const [activeTab, setActiveTab] = useState(1);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [chatStartedTabs, setChatStartedTabs] = useState({});

  const { transcript, resetTranscript } = useSpeechRecognition();

  const addNewTab = () => {
    const newTabId = tabs.length + 1;
    setTabs([...tabs, { id: newTabId, name: `Conversation-${newTabId}` }]);
    setActiveTab(newTabId);
    setMessages({ ...messages, [newTabId]: [] });
    setChatStartedTabs({ ...chatStartedTabs, [newTabId]: false });
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (!chatStartedTabs[tabId]) {
      setChatStartedTabs({ ...chatStartedTabs, [tabId]: false });
    }
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
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Update chatStartedTabs for the current tab
    if (!chatStartedTabs[activeTab]) {
      setChatStartedTabs({ ...chatStartedTabs, [activeTab]: true });
    }

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

      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeTab]: [
          ...prevMessages[activeTab],
          { sender: "bot", text: result },
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
  const renderMessageText = (text) => {
    return { __html: marked(text) };
  };

  const handleMicClick = async () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      const finalTranscript = transcript.trim();

      if (finalTranscript) {
        setInputValue(finalTranscript);

        const result = await fetchApiResponse(
          `http://182.18.139.138:9001/api/student-service/user/v1/assistants?ContentType=${finalTranscript}`
        );

        setMessages((prevMessages) => ({
          ...prevMessages,
          [activeTab]: [
            ...prevMessages[activeTab],
            { sender: "user", text: finalTranscript },
            { sender: "bot", text: result },
          ],
        }));
      }

      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true});
    }

    setIsListening(!isListening);
  };

  const handleTextClick = (text) => {
    setInputValue(text);
  };
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        // Handle audio file
        try {
          // Create a FormData object
          const formData = new FormData();
          formData.append("file", file);
  
          // Send audio file to API
          const response = await axios.post(
            "http://182.18.139.138:9001/api/student-service/user/transcribe",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
  
          // Process response from the API
          const result = response.data;
  
          if (result) {
            // Add the file upload message and the response to the chat
            setMessages((prevMessages) => ({
              ...prevMessages,
              [activeTab]: [
                ...(prevMessages[activeTab] || []),
                { sender: "user", text: `Uploaded audio file: ${file.name}` },
                { sender: "bot", text: result },
              ],
            }));
          }
        } catch (error) {
          console.error("Error uploading audio file:", error);
        }
      } else if (file.type.startsWith("image/")) {
        // Handle image file
        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result;
          setMessages((prevMessages) => ({
            ...prevMessages,
            [activeTab]: [
              ...(prevMessages[activeTab] || []),
              { sender: "user", text: `Uploaded image: ${file.name}`, imageUrl },
            ],
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload an audio or image file.");
      }
    }
  };
  

  // const regenerateResponse = async (messageIndex, originalText) => {
  //   // Call the API again with the original message text
  //   const result = await fetchApiResponse(
  //     `http://182.18.139.138:9001/api/student-service/user/v1/assistants?ContentType=${originalText}`
  //   );

  //   // Update the messages list with the new result
  //   setMessages((prevMessages) => {
  //     const updatedMessages = prevMessages[activeTab].map((msg, index) => {
  //       if (index === messageIndex) {
  //         return { ...msg, text: result };
  //       }
  //       return msg;
  //     });

  //     return {
  //       ...prevMessages,
  //       [activeTab]: updatedMessages,
  //     };
  //   });
  // };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/6 bg-white text-black flex flex-col overflow-y-auto h-full">
      <div className="flex items-center hover:bg-indigo-100 rounded-2xl p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 hover:text-indigo-700 bg-indigo-100 rounded-2xl">
              <RiOpenaiFill size={24} />
            </div>
            <div className="ml-4 text-lg font-medium ">Student GPT</div>
          </div>
        </div>
        <button
          onClick={addNewTab}
          className="p-3 flex items-center justify-center  hover:bg-indigo-200 rounded-md hover:rounded-lg transition-all duration-200"
        >
          <span className="mr-3">NEW CHAT</span>
          <FaRegEdit />
        </button>


        <div className="flex-grow flex flex-col items-center mt-4 overflow-y-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex p-2 mb-1 cursor-pointer w-full items-center  justify-center ${activeTab === tab.id ? "bg-indigo-100" : "bg-indigo-200"
                } hover:bg-gray-400`}
            >
              <img
                src={sideicon}
                alt="Side Icon"
                width={30}
                height={30}
                className="mr-4"
              />
              {tab.name}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-400">
          <Link
            to="/"
            className="flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="ml-2">Log Out</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-5/6 flex flex-col h-screen p-4 overflow-y-scroll">
        <div className="flex flex-col h-full">
          {/* Placeholder Section */}
          {!chatStartedTabs[activeTab] && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <FontAwesomeIcon icon={faCube} size="3x" className="text-gray-700" />
              <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md">
                {[
                  "Details on student loan banks: amounts, rates, fees, collateral, and process.",
                  "Details on major study-abroad exams: TOEFL, IELTS, GRE, GMAT, SAT.",
                  "Share success stories of notable alumni: education and achievements.",
                  "Provide mock tests and sample questions.",
                ].map((text, index) => (
                  <div
                    key={index}
                    onClick={() => handleTextClick(text)}
                    className="p-4 bg-gray-300 rounded-lg shadow hover:bg-gray-400 transition duration-200 cursor-pointer flex items-center justify-center text-center"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages[activeTab]?.map((msg, index) => (
              <div
                className={`flex items-start mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                key={index}
              >
                {msg.sender === "user" && (
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="mt-2 mr-2 text-2xl text-blue-600"
                  />
                )}
                {msg.sender === "bot" && !msg.imageUrl && (
                  <RiOpenaiFill
                    className="mt-2 mr-2 " size={24}
                  />
                )}
                <div
                  className={`relative flex flex-col pl-2 pr-2 rounded-lg shadow ${msg.sender === "user"
                    ? "bg-gray-100 text-black"
                    : "bg-gray-200 text-black"
                    }`}
                  style={{
                    maxWidth: "60%",
                    width: msg.imageUrl ? "auto" : "fit-content",
                  }}
                >
                  {msg.imageUrl ? (
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded"
                      className="w-full max-w-md mt-2 mb-2 rounded-lg"
                    />
                  ) : (
                    <div
                      className="flex-grow"
                      dangerouslySetInnerHTML={renderMessageText(msg.text)}
                    /> 
                  )}
                  {msg.sender === "bot" && !msg.imageUrl && (
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
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => handleSend(e, inputValue)}
            className="flex p-2 border-t border-gray-300"
          >
            <button
              type="button"
              onClick={handleMicClick}
              className={`mr-2 p-2 rounded-full ${isListening ? "bg-red-500" : "bg-gray-700"
                }`}
            >
              {isListening ? (
                <FaMicrophoneAlt className="text-white" size={20} />
              ) : (
                <FaMicrophoneSlash className="text-white" size={20} />
              )}
            </button>
            <div className="relative flex-grow">
              <input
                type="text"
                value={isListening ? transcript : inputValue}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full p-2 pl-4 pr-10 border border-black-500 rounded-full focus:outline-none focus:ring-2 focus:ring-black-400"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 text-white transition duration-200 transform bg-blue-500 rounded-full hover:bg-blue-600 focus:bg-blue-600 focus:outline-none"
              >
                <FontAwesomeIcon icon={faPaperPlane} size={10} />
              </button>
            </div>
            <label
              htmlFor="file-upload"
              className="bg-gray-700 text-white px-2 py-2 ml-2 mr-2 rounded-md cursor-pointer hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={faUpload} />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </form>

          <div className="text-sm text-gray-600 text-center mt-2">
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
    </div>
  );
}

export default ChatGPTDashboard;