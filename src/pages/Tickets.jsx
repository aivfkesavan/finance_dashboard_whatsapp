import { useState, useEffect } from 'react';
import { ticketAPI, agentAPI, conversationAPI, audioAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Phone, Play, User, Calendar } from 'lucide-react';
import './Tickets.css';

export const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTickets();
    if (isAdmin()) {
      fetchAgents();
    }
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? null : statusFilter;
      const data = await ticketAPI.getAllTickets(status);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await agentAPI.getAllAgents();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      await ticketAPI.assignTicket(ticketId, agentId);
      fetchTickets();
    } catch (err) {
      alert('Failed to assign ticket');
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await ticketAPI.updateTicketStatus(ticketId, newStatus);
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const handleViewConversations = async (ticket) => {
    try {
      setSelectedTicket(ticket);
      const data = await conversationAPI.getConversations(ticket.customer_phone);
      setConversations(data.conversations || []);
      setShowConversations(true);
    } catch (err) {
      alert('Failed to fetch conversations');
    }
  };

  const handlePlayAudio = async (phoneNumber, audioId) => {
    try {
      const audioUrl = await audioAPI.playAudio(phoneNumber, audioId);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      alert('Failed to play audio');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="tickets-page">
      <div className="page-header">
        <div>
          <h1>Tickets</h1>
          <p className="text-secondary">Manage customer support tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters card mb-3">
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        {tickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer Phone</th>
                  <th>Query</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="font-medium">{ticket.ticket_id}</td>
                    <td>
                      <div className="flex align-center gap-1">
                        <Phone size={14} />
                        {ticket.customer_phone}
                      </div>
                    </td>
                    <td>
                      <div className="ticket-query">{ticket.customer_query}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${ticket.status.replace('_', '-')}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {isAdmin() && ticket.status === 'open' ? (
                        <select
                          onChange={(e) => handleAssignTicket(ticket.ticket_id, parseInt(e.target.value))}
                          className="assign-select"
                          defaultValue=""
                        >
                          <option value="" disabled>Assign agent...</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.full_name}
                            </option>
                          ))}
                        </select>
                      ) : ticket.assigned_agent ? (
                        <div className="flex align-center gap-1">
                          <User size={14} />
                          {ticket.assigned_agent.full_name}
                        </div>
                      ) : (
                        <span className="text-secondary">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="flex align-center gap-1">
                        <Calendar size={14} />
                        {formatDate(ticket.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => handleViewConversations(ticket)}
                          title="View conversations"
                        >
                          <MessageCircle size={18} />
                        </button>
                        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                          <select
                            onChange={(e) => handleUpdateStatus(ticket.ticket_id, e.target.value)}
                            className="status-select"
                            defaultValue=""
                          >
                            <option value="" disabled>Update status...</option>
                            {ticket.status === 'open' && <option value="assigned">Assign</option>}
                            {['assigned', 'in_progress'].includes(ticket.status) && (
                              <>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolve</option>
                              </>
                            )}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conversations Modal */}
      {showConversations && (
        <div className="modal-overlay" onClick={() => setShowConversations(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Conversation History</h2>
              <button
                className="modal-close"
                onClick={() => setShowConversations(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="conversation-info">
                <p><strong>Ticket:</strong> {selectedTicket?.ticket_id}</p>
                <p><strong>Customer:</strong> {selectedTicket?.customer_phone}</p>
              </div>
              <div className="conversations-list">
                {conversations.length === 0 ? (
                  <p className="text-secondary">No conversations found</p>
                ) : (
                  conversations.map((conv) => (
                    <div key={conv.id} className="conversation-item">
                      <div className="conversation-header">
                        <span className="conversation-time">
                          {formatDate(conv.timestamp)}
                        </span>
                        {conv.message_type === 'audio' && (
                          <button
                            className="btn-icon"
                            onClick={() => handlePlayAudio(conv.phone_number, conv.audio_file_id)}
                            title="Play audio"
                          >
                            <Play size={16} />
                          </button>
                        )}
                      </div>
                      <div className="conversation-message user-message">
                        <strong>Customer:</strong> {conv.user_message}
                      </div>
                      <div className="conversation-message bot-message">
                        <strong>Bot:</strong> {conv.bot_response}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
