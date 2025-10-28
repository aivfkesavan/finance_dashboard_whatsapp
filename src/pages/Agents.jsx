import { useState, useEffect } from 'react';
import { agentAPI, authAPI } from '../services/api';
import { UserPlus, Mail, Shield, Calendar, Clock, User, X } from 'lucide-react';
import './Agents.css';

export const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'agent'
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await agentAPI.getAllAgents();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(formData);
      setShowForm(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'agent'
      });
      fetchAgents();
      alert('Agent created successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create agent');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="agents-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Team Members</h1>
          <p className="subtitle">Manage your support team and administrators</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus size={18} />
          {showForm ? 'Cancel' : 'Add Agent'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="agents-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <User size={20} />
          </div>
          <div>
            <p className="stat-label">Total Agents</p>
            <p className="stat-number">{agents.length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active-icon">
            <Shield size={20} />
          </div>
          <div>
            <p className="stat-label">Active</p>
            <p className="stat-number">{agents.filter(a => a.is_active).length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon admin-icon">
            <Shield size={20} />
          </div>
          <div>
            <p className="stat-label">Admins</p>
            <p className="stat-number">{agents.filter(a => a.role === 'admin').length}</p>
          </div>
        </div>
      </div>

      {/* Create Agent Form */}
      {showForm && (
        <div className="agent-form-card card">
          <div className="form-card-header">
            <h3>Create New Agent</h3>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="agent-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="agent">Agent - Can manage tickets</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <UserPlus size={18} />
                Create Agent
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agents Grid */}
      <div className="agents-grid">
        {agents.length === 0 ? (
          <div className="empty-state">
            <User size={64} />
            <h3>No agents yet</h3>
            <p>Create your first agent to get started</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              {/* Status Badge */}
              <div className="agent-status-badge">
                <span className={`status-dot ${agent.is_active ? 'active' : 'inactive'}`} />
                {agent.is_active ? 'Active' : 'Inactive'}
              </div>

              {/* Agent Header */}
              <div className="agent-header">
                <div className={`agent-avatar ${agent.role === 'admin' ? 'admin-avatar' : ''}`}>
                  {agent.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="agent-info">
                  <h3 className="agent-name">{agent.full_name}</h3>
                  <p className="agent-username">@{agent.username}</p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="role-badge-container">
                <span className={`role-badge role-${agent.role}`}>
                  <Shield size={14} />
                  {agent.role === 'admin' ? 'Administrator' : 'Agent'}
                </span>
              </div>

              {/* Agent Details */}
              <div className="agent-details">
                <div className="agent-detail-item">
                  <div className="detail-icon">
                    <Mail size={16} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{agent.email}</span>
                  </div>
                </div>

                <div className="agent-detail-item">
                  <div className="detail-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Joined</span>
                    <span className="detail-value">{formatDate(agent.created_at)}</span>
                  </div>
                </div>

                {agent.last_login && (
                  <div className="agent-detail-item">
                    <div className="detail-icon">
                      <Clock size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Last Login</span>
                      <span className="detail-value">{formatDate(agent.last_login)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
