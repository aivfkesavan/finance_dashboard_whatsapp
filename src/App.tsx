import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TicketsPage } from './pages/dashboard/TicketsPage';
import { TicketDetailsPage } from './pages/dashboard/TicketDetailsPage';
import { UnassignedTicketsPage } from './pages/dashboard/UnassignedTicketsPage';
import { UsersPage } from './pages/dashboard/UsersPage';
import { WhatsAppUsersPage } from './pages/dashboard/WhatsAppUsersPage';
import { UserConversationPage } from './pages/dashboard/UserConversationPage';
import { KnowledgeBasePage } from './pages/dashboard/KnowledgeBasePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { UsageStatsPage } from './pages/dashboard/UsageStatsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailsPage /></ProtectedRoute>} />
          <Route path="/tickets/unassigned" element={<ProtectedRoute><UnassignedTicketsPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/whatsapp-users" element={<ProtectedRoute><WhatsAppUsersPage /></ProtectedRoute>} />
          <Route path="/whatsapp-users/:userId" element={<ProtectedRoute><UserConversationPage /></ProtectedRoute>} />
          <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
          <Route path="/usage-stats" element={<ProtectedRoute><UsageStatsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
