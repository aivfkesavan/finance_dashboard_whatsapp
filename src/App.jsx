import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { Agents } from './pages/Agents';
import { RAGData } from './pages/RAGData';
import { Logs } from './pages/Logs';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="logs" element={<Logs />} />
            <Route
              path="agents"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Agents />
                </ProtectedRoute>
              }
            />
            <Route
              path="rag-data"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <RAGData />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
