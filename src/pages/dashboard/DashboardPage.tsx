import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardStats } from '../../types';
import {
  Ticket,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats(user?.role);
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment': return 'bg-blue-50 text-blue-600';
      case 'loan': return 'bg-purple-50 text-purple-600';
      case 'account': return 'bg-green-50 text-green-600';
      case 'technical': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{error || 'Failed to load data'}</p>
          <Button onClick={loadDashboardStats} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Overview of your support system</p>
          </div>
          <Button onClick={loadDashboardStats} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total_tickets}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unassigned</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.unassigned_tickets}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.in_progress_tickets}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.resolved_tickets}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <Card className="lg:col-span-2 bg-white border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-gray-900">Recent Tickets</h2>
                  <p className="text-sm text-gray-500">Latest support requests</p>
                </div>
                <Link to="/tickets">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <CardContent className="p-0">
              {stats.recent_tickets.length === 0 ? (
                <div className="py-12 text-center">
                  <Ticket className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tickets yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {stats.recent_tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Ticket className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">{ticket.phone_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(ticket.category)}`}>
                              {ticket.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {ticket.assigned_agent?.full_name || 'Unassigned'} • {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Agents */}
          <Card className="bg-white border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-medium text-gray-900">Top Agents</h2>
              <p className="text-sm text-gray-500">Best performing</p>
            </div>
            <CardContent className="p-0">
              {stats.top_agents.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No agents yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {stats.top_agents.map((agent, index) => (
                    <div key={agent.agent_id} className="flex items-center gap-3 p-4">
                      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{agent.agent_name}</p>
                        <p className="text-xs text-gray-500">{agent.total_resolved} resolved • {agent.active_tickets} active</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {Math.round(agent.utilization)}%
                        </div>
                        <span className={`text-xs ${agent.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                          {agent.is_available ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-medium text-gray-900">Quick Actions</h2>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/tickets/unassigned">
                <Button variant="outline" className="w-full justify-start h-11">
                  <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Ticket Queue
                </Button>
              </Link>
              <Link to="/tickets">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Ticket className="h-4 w-4 mr-2 text-gray-500" />
                  All Tickets
                </Button>
              </Link>
              <Link to="/team">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  Manage Team
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
