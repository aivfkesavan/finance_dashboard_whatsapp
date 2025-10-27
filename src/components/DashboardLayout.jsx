import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Database,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/logs', label: 'Logs', icon: FileText },
    ...(isAdmin() ? [
      { path: '/agents', label: 'Agents', icon: Users },
      { path: '/rag-data', label: 'RAG Data', icon: Database }
    ] : [])
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>IppoPay</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.full_name}</p>
                <p className="user-role">{user?.role}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
