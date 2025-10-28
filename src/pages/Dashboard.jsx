import { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';
import { Ticket, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.getDashboardStats();
      setStats(data.stats);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchStats}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats?.total_tickets || 0,
      icon: Ticket,
      gradient: 'linear-gradient(135deg, #422AFB 0%, #7551FF 100%)',
      iconBg: 'rgba(66, 42, 251, 0.1)'
    },
    {
      title: 'Open Tickets',
      value: stats?.open || 0,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #FFB547 0%, #FFDD99 100%)',
      iconBg: 'rgba(255, 181, 71, 0.1)'
    },
    {
      title: 'In Progress',
      value: (stats?.assigned || 0) + (stats?.in_progress || 0),
      icon: Activity,
      gradient: 'linear-gradient(135deg, #4318FF 0%, #9772FF 100%)',
      iconBg: 'rgba(67, 24, 255, 0.1)'
    },
    {
      title: 'Resolved',
      value: (stats?.resolved || 0) + (stats?.closed || 0),
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #01B574 0%, #00D4A1 100%)',
      iconBg: 'rgba(1, 181, 116, 0.1)'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Welcome back! Here's what's happening with your tickets.</p>
        </div>
      </div>

      {/* Stats Grid - Modern Horizon UI Style */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card-modern">
              <div className="stat-card-content">
                <div className="stat-header">
                  <p className="stat-title">{stat.title}</p>
                  <div className="stat-icon-wrapper" style={{ background: stat.iconBg }}>
                    <Icon size={20} strokeWidth={2.5} style={{ color: stat.gradient.match(/#[A-F0-9]{6}/i)?.[0] }} />
                  </div>
                </div>
                <div className="stat-footer">
                  <h2 className="stat-value">{stat.value}</h2>
                  <div className="stat-trend">
                    <TrendingUp size={14} />
                    <span>Live</span>
                  </div>
                </div>
              </div>
              <div className="stat-card-gradient" style={{ background: stat.gradient }} />
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown Card */}
      <div className="breakdown-card card">
        <div className="breakdown-header">
          <div>
            <h3 className="card-header">Ticket Status Breakdown</h3>
            <p className="card-subtitle">Detailed view of all ticket statuses</p>
          </div>
        </div>

        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-icon">
              <Clock size={18} strokeWidth={2.5} />
            </div>
            <div className="breakdown-content">
              <p className="breakdown-label">Open</p>
              <p className="breakdown-value">{stats?.open || 0}</p>
            </div>
            <span className="badge badge-open">PENDING</span>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-icon">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="breakdown-content">
              <p className="breakdown-label">Assigned</p>
              <p className="breakdown-value">{stats?.assigned || 0}</p>
            </div>
            <span className="badge badge-assigned">ACTIVE</span>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-icon">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="breakdown-content">
              <p className="breakdown-label">In Progress</p>
              <p className="breakdown-value">{stats?.in_progress || 0}</p>
            </div>
            <span className="badge badge-in-progress">WORKING</span>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-icon">
              <CheckCircle size={18} strokeWidth={2.5} />
            </div>
            <div className="breakdown-content">
              <p className="breakdown-label">Resolved</p>
              <p className="breakdown-value">{stats?.resolved || 0}</p>
            </div>
            <span className="badge badge-resolved">DONE</span>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-icon">
              <CheckCircle size={18} strokeWidth={2.5} />
            </div>
            <div className="breakdown-content">
              <p className="breakdown-label">Closed</p>
              <p className="breakdown-value">{stats?.closed || 0}</p>
            </div>
            <span className="badge badge-closed">ARCHIVED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
