import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardStats } from '../../types';
import {
  TicketIcon,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
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

  const statCards = stats
    ? [
        {
          title: 'Total Tickets',
          value: stats.total_tickets,
          icon: TicketIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          title: 'Unassigned',
          value: stats.unassigned_tickets,
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        },
        {
          title: 'In Progress',
          value: stats.in_progress_tickets,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        },
        {
          title: 'Resolved',
          value: stats.resolved_tickets,
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
      ]
    : [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'default',
      in_progress: 'secondary',
      resolved: 'outline',
      closed: 'outline',
    };
    return variants[status] || 'default';
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      payment: 'bg-blue-100 text-blue-800',
      loan: 'bg-purple-100 text-purple-800',
      account: 'bg-green-100 text-green-800',
      technical: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Error Loading Dashboard</CardTitle>
            <CardDescription className="text-red-700">
              {error || 'Failed to load dashboard data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDashboardStats} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>Latest support requests</CardDescription>
              </div>
              <Link to="/tickets">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recent_tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TicketIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No tickets yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recent_tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {ticket.phone_number}
                            </span>
                            <Badge
                              variant="outline"
                              className={getCategoryBadge(ticket.category)}
                            >
                              {ticket.category}
                            </Badge>
                          </div>
                          {ticket.merchant_id && (
                            <p className="text-sm text-gray-600">
                              Merchant: {ticket.merchant_id}
                            </p>
                          )}
                        </div>
                        <Badge variant={getStatusBadge(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {ticket.assigned_agent?.full_name || 'Unassigned'}
                        </span>
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Agents */}
          <Card>
            <CardHeader>
              <CardTitle>Top Agents</CardTitle>
              <CardDescription>Best performing agents</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.top_agents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No agents yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.top_agents.map((agent, index) => (
                    <div key={agent.agent_id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {agent.agent_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{agent.total_resolved} resolved</span>
                          <span>•</span>
                          <span>{agent.active_tickets} active</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <TrendingUp className="h-4 w-4" />
                          {Math.round(agent.utilization)}%
                        </div>
                        <div className={`text-xs ${agent.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                          {agent.is_available ? 'Available' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/tickets/unassigned">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Unassigned Queue
                </Button>
              </Link>
              <Link to="/tickets">
                <Button variant="outline" className="w-full justify-start">
                  <TicketIcon className="h-4 w-4 mr-2" />
                  All Tickets
                </Button>
              </Link>
              <Link to="/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
