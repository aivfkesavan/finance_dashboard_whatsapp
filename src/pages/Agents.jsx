import { useState, useEffect } from 'react';
import { agentAPI, authAPI } from '../services/api';
import { UserPlus, Mail, Shield, Calendar } from 'lucide-react';
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
      alert('Agent created successfully');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create agent');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="agents-page">
      <div className="page-header">
        <div>
          <h1>Agents</h1>
          <p className="text-secondary">Manage support agents</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus size={18} />
          Add Agent
        </button>
      </div>

      {showForm && (
        <div className="card mb-3">
          <div className="card-header">Create New Agent</div>
          <form onSubmit={handleSubmit} className="agent-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
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

      <div className="card">
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <div className="agent-avatar">
                  {agent.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="agent-info">
                  <h3>{agent.full_name}</h3>
                  <p className="agent-username">@{agent.username}</p>
                </div>
              </div>

              <div className="agent-details">
                <div className="agent-detail-item">
                  <Mail size={16} />
                  <span>{agent.email}</span>
                </div>
                <div className="agent-detail-item">
                  <Shield size={16} />
                  <span className={`role-badge role-${agent.role}`}>
                    {agent.role}
                  </span>
                </div>
                <div className="agent-detail-item">
                  <Calendar size={16} />
                  <span>Joined: {formatDate(agent.created_at)}</span>
                </div>
                {agent.last_login && (
                  <div className="agent-detail-item">
                    <Calendar size={16} />
                    <span>Last login: {formatDate(agent.last_login)}</span>
                  </div>
                )}
              </div>

              <div className="agent-status">
                <span className={`status-indicator ${agent.is_active ? 'active' : 'inactive'}`}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
