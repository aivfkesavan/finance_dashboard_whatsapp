import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Users,
  Database,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/logs', label: 'Conversations', icon: MessageSquare },
    ...(isAdmin() ? [
      { path: '/agents', label: 'Agents', icon: Users },
      { path: '/rag-data', label: 'Knowledge Base', icon: Database }
    ] : [])
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <img
              src="https://play-lh.googleusercontent.com/pDvYB-Fb6EP_sUbv98UhKgMRuLrGOG5KRhn0t2wiWs8uA5eF1lQUsOA1tJhIGoYQPrE"
              alt="IppoPay"
              className="logo-image"
            />
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-item-content">
                    <Icon size={20} strokeWidth={2.5} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="active-indicator" />}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">
                <User size={20} />
              </div>
              <div className="user-details">
                <p className="user-name">{user?.full_name || 'User'}</p>
                <p className="user-role">{user?.role || 'Agent'}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <img
              src="https://play-lh.googleusercontent.com/pDvYB-Fb6EP_sUbv98UhKgMRuLrGOG5KRhn0t2wiWs8uA5eF1lQUsOA1tJhIGoYQPrE"
              alt="IppoPay"
              className="logo-image"
            />
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="nav-item-content">
                    <Icon size={20} strokeWidth={2.5} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="active-indicator" />}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">
                <User size={20} />
              </div>
              <div className="user-details">
                <p className="user-name">{user?.full_name || 'User'}</p>
                <p className="user-role">{user?.role || 'Agent'}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
