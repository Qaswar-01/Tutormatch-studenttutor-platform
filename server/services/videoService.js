const axios = require('axios');

class VideoService {
  constructor() {
    this.apiKey = process.env.DAILY_API_KEY;
    this.baseURL = 'https://api.daily.co/v1';
    
    if (!this.apiKey) {
      console.warn('Daily.co API key not found. Video functionality will be limited.');
    }
  }

  // Create a new Daily.co room for a session
  async createRoom(sessionId, options = {}) {
    try {
      if (!this.apiKey) {
        console.log('❌ Daily.co API key not configured, using mock room');
        // Return a mock room URL for development
        return {
          url: `https://tutormatch.daily.co/session-${sessionId}`,
          name: `session-${sessionId}`,
          created_at: new Date().toISOString(),
          config: {
            max_participants: 2,
            enable_chat: true,
            enable_screenshare: true
          }
        };
      }

      console.log('✅ Daily.co API key found, creating real room for session:', sessionId);

      const roomConfig = {
        name: `session-${sessionId}`,
        privacy: 'private',
        properties: {
          max_participants: 2,
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          owner_only_broadcast: false,
          enable_knocking: true,
          enable_prejoin_ui: true,
          exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours from now
          ...options
        }
      };

      const response = await axios.post(
        `${this.baseURL}/rooms`,
        roomConfig,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Daily.co room created successfully:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('Error creating Daily.co room:', error.response?.data || error.message);

      // Return a mock room as fallback
      console.log('Falling back to mock room due to API error');
      return {
        url: `https://tutormatch.daily.co/session-${sessionId}`,
        name: `session-${sessionId}`,
        created_at: new Date().toISOString(),
        config: {
          max_participants: 2,
          enable_chat: true,
          enable_screenshare: true
        }
      };
    }
  }

  // Get room information
  async getRoom(roomName) {
    try {
      if (!this.apiKey) {
        return {
          url: `https://tutormatch.daily.co/${roomName}`,
          name: roomName,
          created_at: new Date().toISOString(),
          config: {
            max_participants: 2,
            enable_chat: true,
            enable_screenshare: true
          }
        };
      }

      const response = await axios.get(
        `${this.baseURL}/rooms/${roomName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting Daily.co room:', error.response?.data || error.message);
      throw new Error('Failed to get room information');
    }
  }

  // Delete a room
  async deleteRoom(roomName) {
    try {
      if (!this.apiKey) {
        console.log(`Mock: Deleting room ${roomName}`);
        return { deleted: true };
      }

      const response = await axios.delete(
        `${this.baseURL}/rooms/${roomName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting Daily.co room:', error.response?.data || error.message);
      throw new Error('Failed to delete room');
    }
  }

  // Create a meeting token for a user
  async createMeetingToken(roomName, userId, userRole, options = {}) {
    try {
      if (!this.apiKey) {
        console.log('❌ Daily.co API key not found, returning mock token');
        // Return a mock token for development
        return {
          token: `mock-token-${userId}-${Date.now()}`,
          room_name: roomName
        };
      }

      console.log('✅ Daily.co API key found, creating real token for room:', roomName);

      const tokenConfig = {
        properties: {
          room_name: roomName,
          user_id: userId,
          is_owner: userRole === 'tutor',
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours
          ...options
        }
      };

      const response = await axios.post(
        `${this.baseURL}/meeting-tokens`,
        tokenConfig,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Daily.co token created successfully for room:', roomName);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating meeting token:', error.response?.data || error.message);
      console.error('❌ Full error details:', error);

      // Return a mock token as fallback
      console.log('⚠️ Falling back to mock token due to API error');
      return {
        token: `mock-token-${userId}-${Date.now()}`,
        room_name: roomName
      };
    }
  }

  // Get room usage/analytics
  async getRoomUsage(roomName, from, to) {
    try {
      if (!this.apiKey) {
        return {
          usage: [],
          total_duration: 0,
          participant_count: 0
        };
      }

      const params = new URLSearchParams({
        room: roomName,
        from: from || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        to: to || new Date().toISOString()
      });

      const response = await axios.get(
        `${this.baseURL}/meetings?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting room usage:', error.response?.data || error.message);
      throw new Error('Failed to get room usage');
    }
  }

  // Update room configuration
  async updateRoom(roomName, config) {
    try {
      if (!this.apiKey) {
        console.log(`Mock: Updating room ${roomName} with config:`, config);
        return { updated: true };
      }

      const response = await axios.post(
        `${this.baseURL}/rooms/${roomName}`,
        { properties: config },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating room:', error.response?.data || error.message);
      throw new Error('Failed to update room');
    }
  }

  // Generate a room URL with token
  generateRoomUrl(roomName, token) {
    const domain = process.env.DAILY_DOMAIN || 'qaswar';
    if (token && !token.includes('mock-token')) {
      return `https://${domain}.daily.co/${roomName}?t=${token}`;
    }
    // For mock tokens, still generate a proper Daily.co URL
    return `https://${domain}.daily.co/${roomName}`;
  }

  // Validate room name format
  validateRoomName(roomName) {
    const roomNameRegex = /^[a-zA-Z0-9-_]{1,60}$/;
    return roomNameRegex.test(roomName);
  }

  // Check if service is properly configured
  isConfigured() {
    return !!this.apiKey;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured(),
      apiKey: this.apiKey ? 'Set' : 'Not set',
      baseURL: this.baseURL
    };
  }
}

module.exports = new VideoService();
