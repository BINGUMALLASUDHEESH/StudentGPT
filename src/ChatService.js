// src/ChatService.js

const API_URL = 'http://localhost:8080/chat';

async function sendMessage(message) {
  const response = await fetch(`${API_URL}?message=${encodeURIComponent(message)}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export { sendMessage };
