import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  Ticket,
  TicketDetails,
  AgentStats,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  AssignTicketRequest,
  UpdateTicketStatusRequest,
  AddTicketNoteRequest,
  PaginatedResponse,
  TicketQueryParams,
  UserQueryParams,
  DashboardStats,
  WhatsAppUser,
  WhatsAppUserQueryParams,
  WhatsAppUserDetails,
  KnowledgeBaseEntry,
  CreateKnowledgeBaseEntry,
  UpdateKnowledgeBaseEntry,
  RAGSyncStatus,
  RAGSyncResult,
  CSVImportResult,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const data = response.data.data || response.data;
            const { access_token, refresh_token: newRefreshToken } = data;
            localStorage.setItem('access_token', access_token);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post('/api/v1/auth/login', credentials);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/v1/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/v1/auth/me');
    // Handle different response formats - API might return user directly or wrapped in data
    const data = response.data;
    if (data.data) {
      return data.data.user || data.data;
    }
    return data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.client.post('/api/v1/auth/change-password', data);
  }

  // Tickets
  async listTickets(params?: TicketQueryParams): Promise<PaginatedResponse<Ticket>> {
    const response = await this.client.get('/api/v1/tickets', {
      params,
    });
    const data = response.data.data;
    // Transform API response format to match our PaginatedResponse type
    return {
      items: data.tickets || [],
      total: data.total || 0,
      page: params?.page || 1,
      page_size: params?.page_size || data.limit || 50,
      total_pages: Math.ceil((data.total || 0) / (data.limit || 50)),
    };
  }

  async getTicket(id: string): Promise<TicketDetails> {
    const response = await this.client.get(`/api/v1/tickets/${id}`);
    const ticket = response.data.data.ticket || response.data.data;
    
    // Transform conversation history format
    const conversationHistory = (ticket.conversation_history || []).map((msg: any, index: number) => ({
      id: msg.id || `msg-${index}`,
      ticket_id: id,
      sender: msg.role === 'assistant' ? 'bot' : msg.role || 'user',
      message: msg.content || msg.message || '',
      timestamp: msg.timestamp,
      metadata: msg.metadata,
      // New fields for audio and language support
      message_type: msg.message_type || 'text',
      language: msg.language || null,
      audio: msg.audio || null,
    }));
    
    // Transform activities format
    const activityLog = (ticket.activities || ticket.activity_log || []).map((act: any, index: number) => ({
      id: act.id || `act-${index}`,
      ticket_id: id,
      action_type: act.action_type || 'note_added',
      action_by: act.action_by || act.user_id || '',
      action_by_name: act.action_by_name || act.user_name,
      description: act.description || act.content || '',
      timestamp: act.timestamp || act.created_at,
      metadata: act.metadata,
    }));
    
    return {
      ...ticket,
      conversation_history: conversationHistory,
      activity_log: activityLog,
    };
  }

  async assignTicket(id: string, data: AssignTicketRequest): Promise<Ticket> {
    const response = await this.client.patch(`/api/v1/tickets/${id}/assign`, data);
    return response.data.data;
  }

  async updateTicketStatus(id: string, data: UpdateTicketStatusRequest): Promise<Ticket> {
    const response = await this.client.patch(`/api/v1/tickets/${id}/status`, data);
    return response.data.data;
  }

  async addTicketNote(id: string, data: AddTicketNoteRequest): Promise<void> {
    await this.client.post(`/api/v1/tickets/${id}/notes`, data);
  }

  // Users
  async listUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.client.get('/api/v1/admin/users', {
      params,
    });
    const data = response.data.data;
    // Transform API response format to match our PaginatedResponse type
    return {
      items: data.users || [],
      total: data.total || 0,
      page: params?.page || 1,
      page_size: params?.page_size || data.limit || 100,
      total_pages: Math.ceil((data.total || 0) / (data.limit || 100)),
    };
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.client.post('/api/v1/admin/users', data);
    return response.data.data;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await this.client.put(`/api/v1/admin/users/${id}`, data);
    return response.data.data;
  }

  // Agent Stats
  async getAgentStats(): Promise<AgentStats[]> {
    const response = await this.client.get('/api/v1/admin/users/agents/stats');
    return response.data.data;
  }

  async toggleAgentAvailability(agentId: string, isAvailable: boolean): Promise<void> {
    await this.client.patch(`/api/v1/admin/users/agents/${agentId}/availability`, {
      is_available: isAvailable,
    });
  }

  // Dashboard Stats
  async getDashboardStats(userRole?: string): Promise<DashboardStats> {
    const isAdmin = userRole === 'super_admin' || userRole === 'admin';
    
    // For agents, only fetch tickets (they can't access admin endpoints)
    if (!isAdmin) {
      try {
        const ticketsResponse = await this.listTickets({ page: 1, page_size: 10 });
        const allTickets = await this.listTickets({ page: 1, page_size: 1000 });
        const items = allTickets?.items || [];
        
        return {
          total_tickets: allTickets?.total || 0,
          unassigned_tickets: items.filter(t => !t.assigned_agent_id).length,
          in_progress_tickets: items.filter(t => t.status === 'in_progress').length,
          resolved_tickets: items.filter(t => t.status === 'resolved').length,
          recent_tickets: ticketsResponse?.items || [],
          top_agents: [], // Agents can't see agent stats
        };
      } catch (err) {
        // Return empty stats if agent doesn't have access
        return {
          total_tickets: 0,
          unassigned_tickets: 0,
          in_progress_tickets: 0,
          resolved_tickets: 0,
          recent_tickets: [],
          top_agents: [],
        };
      }
    }
    
    // For admins, fetch all data
    const [ticketsResponse, agentStatsResponse] = await Promise.all([
      this.listTickets({ page: 1, page_size: 10 }),
      this.getAgentStats().catch(() => []), // Gracefully handle if agent stats fail
    ]);

    // Calculate stats from tickets
    const allTickets = await this.listTickets({ page: 1, page_size: 1000 });
    const items = allTickets?.items || [];
    const agents = agentStatsResponse || [];

    const stats: DashboardStats = {
      total_tickets: allTickets?.total || 0,
      unassigned_tickets: items.filter(t => !t.assigned_agent_id).length,
      in_progress_tickets: items.filter(t => t.status === 'in_progress').length,
      resolved_tickets: items.filter(t => t.status === 'resolved').length,
      recent_tickets: ticketsResponse?.items || [],
      top_agents: Array.isArray(agents) ? agents.slice(0, 5) : [],
    };

    return stats;
  }

  // WhatsApp Users
  async listWhatsAppUsers(params: WhatsAppUserQueryParams = {}): Promise<{ users: WhatsAppUser[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.is_merchant !== undefined) queryParams.append('is_merchant', String(params.is_merchant));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.offset !== undefined) queryParams.append('offset', String(params.offset));

    const response = await this.client.get(`/api/v1/users?${queryParams.toString()}`);
    const data = response.data.data || response.data;
    
    return {
      users: data.users || [],
      total: data.total || 0,
    };
  }

  async getWhatsAppUserConversations(userId: number, params?: { limit?: number; offset?: number }): Promise<WhatsAppUserDetails> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset !== undefined) queryParams.append('offset', String(params.offset));

    const url = `/api/v1/users/${userId}/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.client.get(url);
    const data = response.data.data || response.data;

    return {
      user: data.user,
      conversations: data.conversations || [],
      total_messages: data.total_messages || 0,
      tickets: data.tickets || [],
    };
  }

  // RAG Knowledge Base APIs
  async listKnowledgeBaseEntries(params?: { 
    skip?: number; 
    limit?: number; 
    category?: string; 
    search?: string; 
  }): Promise<{ entries: KnowledgeBaseEntry[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', String(params.skip));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const response = await this.client.get(`/api/v1/rag/entries?${queryParams.toString()}`);
    const data = response.data.data || response.data;

    return {
      entries: data.entries || [],
      total: data.total || 0,
    };
  }

  async getKnowledgeBaseEntry(id: number): Promise<KnowledgeBaseEntry> {
    const response = await this.client.get(`/api/v1/rag/entries/${id}`);
    return response.data.data || response.data;
  }

  async createKnowledgeBaseEntry(entry: CreateKnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    const response = await this.client.post('/api/v1/rag/entries', entry);
    return response.data.data || response.data;
  }

  async updateKnowledgeBaseEntry(id: number, entry: UpdateKnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    const response = await this.client.put(`/api/v1/rag/entries/${id}`, entry);
    return response.data.data || response.data;
  }

  async deleteKnowledgeBaseEntry(id: number): Promise<void> {
    await this.client.delete(`/api/v1/rag/entries/${id}`);
  }

  async syncToQdrant(): Promise<RAGSyncResult> {
    const response = await this.client.post('/api/v1/rag/sync');
    return response.data.stats || response.data.data?.stats || response.data;
  }

  async getRAGSyncStatus(): Promise<RAGSyncStatus> {
    const response = await this.client.get('/api/v1/rag/status');
    return response.data.data || response.data;
  }

  async getRAGCategories(): Promise<string[]> {
    const response = await this.client.get('/api/v1/rag/categories');
    const data = response.data.data || response.data;
    return data.categories || [];
  }

  async getNextQuestionId(): Promise<number> {
    const response = await this.client.get('/api/v1/rag/next-id');
    const data = response.data.data || response.data;
    return data.next_question_id;
  }

  async importCSV(file: File, clearExisting: boolean = false): Promise<CSVImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(
      `/api/v1/rag/import-csv?clear_existing=${clearExisting}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.stats || response.data.data?.stats || response.data;
  }
}

export const api = new ApiClient();
