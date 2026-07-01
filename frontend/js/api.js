// API Service Layer for interacting with backend REST endpoints
const API_BASE_URL = 'http://localhost:3000/api';

const OpenChatAPI = {
  // Fetch list of rooms
  async getRooms() {
    try {
      console.log("OpenChatAPI: getRooms - api.js ", `${API_BASE_URL}/rooms`)
      const response = await fetch(`${API_BASE_URL}/rooms`);
      console.log("OpenChatAPI: getRooms - api.js after fetch")
      const result = await response.json();
      console.log("OpenChatAPI: getRooms - api.js after json", result);
      if (!response.ok) throw new Error(result.message || 'Failed to fetch rooms.');
      console.log("OpenChatAPI: getRooms - api.js before return")
      return result.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Create a new room
  async createRoom(roomName) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create room.');
      return result.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Get messages for a given room
  async getMessages(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${roomId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch messages.');
      return result.data;
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(roomId, username, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, username, message })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send message.');
      return result.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

window.OpenChatAPI = OpenChatAPI;
