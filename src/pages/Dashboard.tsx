import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { DashboardStats } from '../types';
import { Ticket, Clock, CheckCircle, Users, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_tickets || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unassigned</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.unassigned_tickets || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Waiting for assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.in_progress_tickets || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.resolved_tickets || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tickets</CardTitle>
                <Link to="/tickets">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent_tickets.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No tickets yet</p>
                ) : (
                  stats?.recent_tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">#{ticket.id.slice(0, 8)}</p>
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{ticket.phone_number}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <Badge className="capitalize">{ticket.category}</Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Agents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agent Performance</CardTitle>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.top_agents.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No agent data yet</p>
                ) : (
                  stats?.top_agents.map((agent) => (
                    <div
                      key={agent.agent_id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{agent.agent_name}</p>
                        <p className="text-sm text-gray-600">
                          {agent.active_tickets} / {agent.capacity} tickets
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round(agent.utilization)}%
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              agent.is_available ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          <span className="text-xs text-gray-500">
                            {agent.is_available ? 'Available' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
