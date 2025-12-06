// User Types
export type UserRole = 'super_admin' | 'admin' | 'agent';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
  is_available?: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Ticket Types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'payment' | 'loan' | 'account' | 'technical' | 'general';

export interface AssignedAgent {
  id: number;
  username: string;
  full_name: string;
  department?: string;
}

export interface Ticket {
  id: string;
  ticket_id?: string;
  phone_number: string;
  merchant_id?: string;
  category: TicketCategory;
  status: TicketStatus;
  escalation_reason?: string;
  assigned_agent_id?: number;
  assigned_agent?: AssignedAgent;
  assigned_at?: string;
  auto_assigned?: boolean;
  reassignment_count?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_notes?: string;
  waiting_time?: number;
}

export interface ConversationMessage {
  id: string;
  ticket_id: string;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  action_type: 'created' | 'assigned' | 'status_changed' | 'note_added' | 'resolved';
  action_by: string;
  action_by_name?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TicketDetails extends Ticket {
  conversation_history: ConversationMessage[];
  activity_log: TicketActivity[];
  internal_notes?: Array<{
    id: string;
    note: string;
    created_by: string;
    created_by_name?: string;
    created_at: string;
  }>;
}

// Agent Types
export interface AgentStats {
  agent_id: string;
  agent_name: string;
  total_assigned: number;
  total_resolved: number;
  active_tickets: number;
  capacity: number;
  utilization: number;
  is_available: boolean;
  department?: string;
}

// API Request/Response Types
export interface CreateUserRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'agent';
  department?: string;
  agent_capacity?: number;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  role?: 'admin' | 'agent';
  department?: string;
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AssignTicketRequest {
  agent_id: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
  resolution_notes?: string;
}

export interface AddTicketNoteRequest {
  note: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Query Parameters
export interface TicketQueryParams extends PaginationParams {
  status?: TicketStatus;
  category?: TicketCategory;
  assigned_agent_id?: string;
  search?: string;
}

export interface UserQueryParams extends PaginationParams {
  role?: 'super_admin' | 'admin' | 'agent';
  department?: string;
  is_active?: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  total_tickets: number;
  unassigned_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  recent_tickets: Ticket[];
  top_agents: AgentStats[];
}

// WhatsApp User Types
export interface WhatsAppUser {
  id: number;
  phone_number: string;
  name?: string;
  is_merchant: boolean;
  merchant_id?: string;
  language_preference?: string;
  created_at: string;
  updated_at?: string;
}

export interface WhatsAppUserQueryParams {
  search?: string;
  is_merchant?: boolean;
  limit?: number;
  offset?: number;
}

export interface WhatsAppUserConversation {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'audio' | 'image';
  timestamp: string;
  language?: {
    detected?: string;
    response?: string;
  };
  audio?: {
    file_name: string;
    file_url: string;
    media_id?: string;
    transcription?: string;
  };
  routing?: {
    decision?: {
      intent?: string;
      service?: string;
      endpoint?: string;
      confidence?: number;
      action?: string;
      reason?: string;
    };
    merchant_check_performed?: boolean;
    merchant_exists?: boolean;
    merchant_check?: boolean;
  };
  orchestrator?: {
    flow?: string;
    processing_time_ms?: number;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
  };
  api_info?: {
    endpoints_called?: string[];
    response_data?: any;
    success?: boolean;
    error?: string;
  };
  knowledge_base?: any;
  dispute?: any;
}

export interface WhatsAppUserDetails {
  user: WhatsAppUser;
  conversations: WhatsAppUserConversation[];
  total_messages: number;
  tickets?: Ticket[];
}
