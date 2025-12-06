import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { api } from '../../lib/api';
import type { Ticket, User, PaginatedResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertCircle,
  RefreshCw,
  UserPlus,
  Eye,
  Clock,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react';

export function UnassignedTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PaginatedResponse<Ticket> | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUnassignedTickets();
    loadAgents();
  }, []);

  const loadUnassignedTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listTickets({
        page: 1,
        page_size: 100,
      });

      // Show all open/in_progress tickets (tickets that need attention)
      const items = data?.items || [];
      const openTickets = items.filter(t => t.status === 'open' || t.status === 'in_progress');
      const result = {
        ...data,
        items: openTickets,
        total: openTickets.length,
      };

      setTickets(result);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view tickets.');
      } else {
        setError('Failed to load tickets');
      }
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await api.listUsers({ role: 'agent', is_active: true, page_size: 100 });
      setAgents(response?.items || []);
    } catch (err: any) {
      // Silently fail for agents who can't access user list
      if (err.response?.status !== 403) {
        console.error('Error loading agents:', err);
      }
    }
  };

  const handleAssignTicket = async (ticketId: string) => {
    const agentId = selectedAgents[ticketId];
    if (!agentId) return;

    try {
      setAssigningTicket(ticketId);
      await api.assignTicket(ticketId, { agent_id: agentId });
      await loadUnassignedTickets();

      // Clear selection
      const newSelectedAgents = { ...selectedAgents };
      delete newSelectedAgents[ticketId];
      setSelectedAgents(newSelectedAgents);
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert('Failed to assign ticket');
    } finally {
      setAssigningTicket(null);
    }
  };

  const handleAgentSelect = (ticketId: string, agentId: string) => {
    setSelectedAgents(prev => ({
      ...prev,
      [ticketId]: agentId,
    }));
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

  const formatWaitTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getWaitTimeColor = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 30) return 'text-green-600';
    if (diffInMinutes < 120) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedTickets = tickets
    ? [...tickets.items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              Ticket Queue
            </h1>
            <p className="text-gray-600 mt-1">
              {tickets ? `${tickets.total} open tickets requiring attention` : 'Loading...'}
            </p>
          </div>
          <Button onClick={loadUnassignedTickets} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {tickets && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tickets.total}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Oldest Waiting</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {sortedTickets.length > 0
                        ? formatWaitTime(sortedTickets[0].created_at)
                        : '0m'}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Agents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {agents.filter(a => a.is_available).length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
            <CardDescription>
              All open and in-progress tickets, sorted by wait time (oldest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !tickets ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadUnassignedTickets} variant="outline">
                  Retry
                </Button>
              </div>
            ) : sortedTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No open tickets</p>
                <p className="text-sm">All tickets have been resolved or closed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50 hover:border-orange-300 transition-all"
                  >
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded">
                            {ticket.ticket_id || `#${ticket.id}`}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {ticket.phone_number}
                          </span>
                          <Badge
                            variant="outline"
                            className={getCategoryBadge(ticket.category)}
                          >
                            {ticket.category}
                          </Badge>
                          <Badge variant={ticket.status === 'open' ? 'warning' : ticket.status === 'resolved' ? 'success' : 'default'}>
                            {ticket.status}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 text-sm font-medium ${getWaitTimeColor(
                              ticket.created_at
                            )}`}
                          >
                            <Clock className="h-4 w-4" />
                            {formatWaitTime(ticket.created_at)} waiting
                          </div>
                        </div>
                        
                        {/* Escalation Reason */}
                        {ticket.escalation_reason && (
                          <div className="flex items-start gap-2 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">{ticket.escalation_reason}</p>
                          </div>
                        )}

                        {/* Assigned Agent Info */}
                        {ticket.assigned_agent && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <UserIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="text-blue-800 font-medium">Assigned to: </span>
                              <span className="text-blue-700">{ticket.assigned_agent.full_name}</span>
                              {ticket.assigned_agent.department && (
                                <span className="text-blue-600"> ({ticket.assigned_agent.department})</span>
                              )}
                              {ticket.assigned_at && (
                                <span className="text-blue-500 text-xs ml-2">
                                  at {new Date(ticket.assigned_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {ticket.merchant_id && (
                          <p className="text-sm text-gray-600">
                            Merchant: <span className="font-mono">{ticket.merchant_id}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Link to={`/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>

                    {/* Assignment Section */}
                    {(user?.role === 'super_admin' || user?.role === 'admin') && (
                      <div className="flex gap-2 pt-3 border-t border-orange-200">
                        <div className="flex-1">
                          <Select
                            value={selectedAgents[ticket.id] || ''}
                            onChange={(e) => handleAgentSelect(ticket.id, e.target.value)}
                          >
                            <option value="">Select agent to assign...</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.full_name}
                                {agent.department && ` (${agent.department})`}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <Button
                          onClick={() => handleAssignTicket(ticket.id)}
                          disabled={
                            !selectedAgents[ticket.id] || assigningTicket === ticket.id
                          }
                          size="sm"
                        >
                          {assigningTicket === ticket.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Availability */}
        {agents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Availability</CardTitle>
              <CardDescription>Current status of all agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{agent.full_name}</p>
                        {agent.department && (
                          <p className="text-sm text-gray-600 capitalize">{agent.department}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={agent.is_active ? 'success' : 'secondary'}
                        >
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge
                          variant={agent.is_available ? 'default' : 'secondary'}
                          className={
                            agent.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {agent.is_available ? 'Available' : 'Busy'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
