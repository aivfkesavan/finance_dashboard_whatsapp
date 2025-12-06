import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import type { Ticket, User, PaginatedResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertCircle,
  RefreshCw,
  UserPlus,
  Clock,
  Ticket as TicketIcon,
  User as UserIcon,
  Users,
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
      const data = await api.listTickets({ page: 1, page_size: 100 });

      const items = data?.items || [];
      const openTickets = items.filter(t => t.status === 'open' || t.status === 'in_progress');
      
      setTickets({
        ...data,
        items: openTickets,
        total: openTickets.length,
      });
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view tickets.');
      } else {
        setError('Failed to load tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await api.listUsers({ role: 'agent', is_active: true, page_size: 100 });
      setAgents(response?.items || []);
    } catch (err: any) {
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
      
      const newSelectedAgents = { ...selectedAgents };
      delete newSelectedAgents[ticketId];
      setSelectedAgents(newSelectedAgents);
    } catch (err) {
      alert('Failed to assign ticket');
    } finally {
      setAssigningTicket(null);
    }
  };

  const formatWaitTime = (createdAt: string) => {
    const diffInMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getWaitTimeColor = (createdAt: string) => {
    const diffInMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    if (diffInMinutes < 30) return 'text-green-600';
    if (diffInMinutes < 120) return 'text-amber-600';
    return 'text-red-600';
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

  const sortedTickets = tickets
    ? [...tickets.items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  const canAssign = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ticket Queue</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {tickets ? `${tickets.total} tickets need attention` : 'Loading...'}
            </p>
          </div>
          <Button onClick={loadUnassignedTickets} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{tickets?.total || 0}</p>
                <p className="text-xs text-gray-500">Open Tickets</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {sortedTickets.length > 0 ? formatWaitTime(sortedTickets[0].created_at) : '0m'}
                </p>
                <p className="text-xs text-gray-500">Oldest Wait</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {agents.filter(a => a.is_available).length}
                </p>
                <p className="text-xs text-gray-500">Available Agents</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        {loading && !tickets ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{error}</p>
              <Button onClick={loadUnassignedTickets} variant="outline" className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : sortedTickets.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="py-16 text-center">
              <TicketIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500">No open tickets at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedTickets.map((ticket) => (
              <Card key={ticket.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <TicketIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {ticket.ticket_id || `#${ticket.id}`}
                          </span>
                          <span className="font-medium text-gray-900">{ticket.phone_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(ticket.category)}`}>
                            {ticket.category}
                          </span>
                          <Badge variant={ticket.status === 'open' ? 'warning' : 'default'} className="text-xs">
                            {ticket.status}
                          </Badge>
                          <span className={`flex items-center gap-1 text-xs font-medium ${getWaitTimeColor(ticket.created_at)}`}>
                            <Clock className="h-3 w-3" />
                            {formatWaitTime(ticket.created_at)}
                          </span>
                        </div>

                        {ticket.escalation_reason && (
                          <p className="text-sm text-gray-600 mt-2 p-2 bg-amber-50 border border-amber-100 rounded">
                            {ticket.escalation_reason}
                          </p>
                        )}

                        {ticket.assigned_agent && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <UserIcon className="h-3.5 w-3.5" />
                            <span>Assigned to {ticket.assigned_agent.full_name}</span>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          Created {new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Link to={`/tickets/${ticket.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        View
                      </Button>
                    </Link>
                  </div>

                  {canAssign && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <select
                        value={selectedAgents[ticket.id] || ''}
                        onChange={(e) => setSelectedAgents(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white"
                      >
                        <option value="">Select agent...</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.full_name} {agent.department && `(${agent.department})`}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleAssignTicket(ticket.id)}
                        disabled={!selectedAgents[ticket.id] || assigningTicket === ticket.id}
                        size="sm"
                      >
                        {assigningTicket === ticket.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Agent Status */}
        {agents.length > 0 && (
          <Card className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-medium text-gray-900">Agent Status</h2>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{agent.full_name}</p>
                      <p className={`text-xs ${agent.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                        {agent.is_available ? 'Available' : 'Busy'}
                      </p>
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
