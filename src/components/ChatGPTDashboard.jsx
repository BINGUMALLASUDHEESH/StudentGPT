import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPaperPlane, faSignOutAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function ChatGPTDashboard() {
  const [tabs, setTabs] = useState([{ id: 1, name: 'Chat 1' }]);
  const [activeTab, setActiveTab] = useState(1);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const countries = [
    { id: 1, name: 'USA' },
    { id: 2, name: 'UK' },
    { id: 3, name: 'Canada' },
    { id: 4, name: 'Australia' },
    { id: 5, name: 'Germany' },
    { id: 6, name: 'France' },
    { id: 7, name: 'Netherlands' },
    { id: 8, name: 'New Zealand' },
    { id: 9, name: 'Sweden' },
    { id: 10, name: 'China' },
    { id: 11, name: 'Japan' },
    { id: 12, name: 'South Korea' },
    { id: 13, name: 'Singapore' },
    { id: 14, name: 'Italy' },
    { id: 15, name: 'Spain' },
    { id: 16, name: 'Switzerland' },
    { id: 17, name: 'Norway' },
    { id: 18, name: 'Finland' },
    { id: 19, name: 'Denmark' },
    { id: 20, name: 'Belgium' },
    { id: 21, name: 'Austria' },
    { id: 22, name: 'Poland' },
    { id: 23, name: 'Russia' },
    { id: 24, name: 'Malaysia' },
    { id: 25, name: 'UAE' },
    { id: 26, name: 'Turkey' },
    { id: 27, name: 'Brazil' },
    { id: 28, name: 'Argentina' },
    { id: 29, name: 'South Africa' },
    { id: 30, name: 'India' },
    { id: 31, name: 'Portugal' },
    { id: 32, name: 'Greece' },
    { id: 33, name: 'Mexico' },
    { id: 34, name: 'Chile' }
  ];

  const itemsPerPage = 12;
  const totalPages = Math.ceil(countries.length / itemsPerPage);

  const displayedCountries = countries.slice(currentIndex, currentIndex + itemsPerPage);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + itemsPerPage, (totalPages - 1) * itemsPerPage));
  };

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

    const newMessages = [...(messages[activeTab] || []), { sender: 'user', text: inputValue }];
    setMessages({ ...messages, [activeTab]: newMessages });
    setInputValue('');

    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post(
        `http://182.18.139.138:9001/api/student-service/user/chat?InfoType=${inputValue}&userId=${userId}`
      );

      const botResponse = response.data;
      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeTab]: [...prevMessages[activeTab], { sender: 'bot', text: botResponse }],
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeTab]: [
          ...prevMessages[activeTab],
          { sender: 'bot', text: 'Error: Unable to get response' },
        ],
      }));
    }
  };

  const handleCountryClick = (countryName) => {
    alert(`You clicked on ${countryName}`);
    // Add your logic here to handle the country selection
  };

  return (
    <div className="flex h-screen" >
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white flex flex-col">
        <button
          onClick={addNewTab}
          className="p-4 flex items-center justify-center bg-gray-700 hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="ml-2">NEW CHAT</span>
        </button>
        <div className="flex-grow overflow-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`p-4 cursor-pointer ${
                activeTab === tab.id ? 'bg-gray-600' : 'bg-gray-700'
              } hover:bg-gray-600`}
            >
              {tab.name}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-600">
          <a
            href="/"
            className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="ml-2">Log Out</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 flex flex-col">
        <div className="p-4 bg-gray-200 shadow-md" >
          <h1 className="text-2xl font-semibold" style={{height:'65vh'}}>
            {tabs.find((tab) => tab.id === activeTab)?.name}
          </h1>
        </div>
        <div className="flex-grow p-4 overflow-auto bg-gray-100" >
          {messages[activeTab]?.map((msg, index) => (
            <div
              key={index}
              className={`p-2 mb-2 rounded ${
                msg.sender === 'user' ? 'bg-blue-200' : 'bg-green-200'
              }`}
            >
              <strong>{msg.sender === 'user' ? 'You' : ''}</strong> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex p-4 border-t border-gray-300 items-center" style={{ marginTop: '30px' }}>
  <input
    type="text"
    value={inputValue}
    onChange={handleInputChange}
    placeholder="Type your message..."
    className="flex-grow border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-300 text-base"
    style={{  height: '40px', padding: '8px' }} // Adjusted padding and height
  />
  <button
    type="submit"
    className={`bg-blue-500 text-white rounded-md ml-2 ${
      inputValue.trim() ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'
    }`}
    style={{ height: '40px', padding: '8px 12px', lineHeight: '24px' ,width:'10%' }} // Match height and padding
    disabled={!inputValue.trim()}
  >
    <FontAwesomeIcon icon={faPaperPlane} />
  </button>
</form>



        {/* Explore Countries */}
        <div className="p-4 bg-gray-200 border-t border-gray-300 mt-6" style={{marginTop:'0px'}}>
          <h2 className="text-xl font-semibold mb-4">Explore Countries</h2>
          <div className="flex items-center">
            <button
              onClick={goToPrevious}
              className="p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 focus:outline-none"
              style={{ marginRight: '10px', fontSize: '12px' }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="flex flex-grow overflow-x-auto gap-2">
              {displayedCountries.map((country) => (
                <div
                  key={country.id}
                  className="p-2 bg-white border border-gray-300 rounded shadow-sm cursor-pointer"
                  onClick={() => handleCountryClick(country.name)}
                >
                  {country.name}
                </div>
              ))}
            </div>
            <button
              onClick={goToNext}
              className="p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 focus:outline-none"
              style={{ marginLeft: '10px', fontSize: '12px' }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatGPTDashboard;