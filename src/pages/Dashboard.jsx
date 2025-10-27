import { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';
import { Ticket, CheckCircle, Clock, XCircle } from 'lucide-react';
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
    return <div className="spinner"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats?.total_tickets || 0,
      icon: Ticket,
      color: '#4f46e5',
      bgColor: '#eef2ff'
    },
    {
      title: 'Open Tickets',
      value: stats?.open || 0,
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'In Progress',
      value: (stats?.assigned || 0) + (stats?.in_progress || 0),
      icon: Clock,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Resolved',
      value: (stats?.resolved || 0) + (stats?.closed || 0),
      icon: CheckCircle,
      color: '#10b981',
      bgColor: '#d1fae5'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="text-secondary">Overview of ticket statistics</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <p className="stat-title">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="stats-details card">
        <div className="card-header">Ticket Status Breakdown</div>
        <div className="stats-table">
          <div className="stats-row">
            <span className="stats-label">Open</span>
            <span className="badge badge-open">{stats?.open || 0}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">Assigned</span>
            <span className="badge badge-assigned">{stats?.assigned || 0}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">In Progress</span>
            <span className="badge badge-in-progress">{stats?.in_progress || 0}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">Resolved</span>
            <span className="badge badge-resolved">{stats?.resolved || 0}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">Closed</span>
            <span className="badge badge-closed">{stats?.closed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
