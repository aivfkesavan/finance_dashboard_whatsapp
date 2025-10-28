import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ippopay-dev-api.vibestud.io';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/dashboard/auth/login', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/dashboard/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/dashboard/auth/me');
    return response.data;
  },
};

// Ticket APIs
export const ticketAPI = {
  getAllTickets: async (status = null, limit = 50) => {
    const params = { limit };
    if (status) params.status = status;
    const response = await api.get('/api/dashboard/tickets', { params });
    return response.data;
  },

  assignTicket: async (ticketId, agentId) => {
    const response = await api.post(`/api/dashboard/tickets/${ticketId}/assign`, {
      ticket_id: ticketId,
      agent_id: agentId,
    });
    return response.data;
  },

  updateTicketStatus: async (ticketId, status, notes = '') => {
    const response = await api.put(`/api/dashboard/tickets/${ticketId}/status`, {
      status,
      notes,
    });
    return response.data;
  },
};

// Conversation APIs
export const conversationAPI = {
  getConversations: async (phoneNumber, limit = 50) => {
    const response = await api.get(`/api/dashboard/conversations/${phoneNumber}`, {
      params: { limit },
    });
    return response.data;
  },
};

// Audio APIs
export const audioAPI = {
  getAudioURL: (phoneNumber, audioId) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/api/dashboard/audio/${phoneNumber}/${audioId}?token=${token}`;
  },

  playAudio: async (phoneNumber, audioId) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/dashboard/audio/${phoneNumber}/${audioId}`;
    console.log('Fetching audio from:', url);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Audio response status:', response.status);
    console.log('Audio response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Audio fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch audio: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    console.log('Audio blob created:', blob.size, 'bytes, type:', blob.type);

    const objectUrl = URL.createObjectURL(blob);
    console.log('Audio object URL created:', objectUrl);
    return objectUrl;
  },
};

// Agent APIs
export const agentAPI = {
  getAllAgents: async () => {
    const response = await api.get('/api/dashboard/agents');
    return response.data;
  },
};

// Dashboard Stats APIs
export const statsAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

// RAG Data APIs
export const ragAPI = {
  updateRAGData: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post('/api/dashboard/rag/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Phone & Conversation APIs
export const phoneAPI = {
  // Get all phone numbers
  getAllPhones: async () => {
    const response = await api.get('/api/dashboard/phones');
    return response.data;
  },

  // Get complete information for a specific phone number
  getPhoneDetails: async (phoneNumber) => {
    const response = await api.get(`/api/dashboard/phones/${phoneNumber}`);
    return response.data;
  },

  // Get system/application logs (Admin only)
  getSystemLogs: async (lines = 100, level = null) => {
    const params = { lines };
    if (level) params.level = level;
    const response = await api.get('/api/dashboard/logs/system', { params });
    return response.data;
  },
};

export default api;
