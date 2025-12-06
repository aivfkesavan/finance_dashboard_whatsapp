import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';
import { api } from '../lib/api';
import { formatDate, calculateWaitingTime, getWaitingTimeBadgeColor } from '../lib/utils';
import type { Ticket, User } from '../types';
import { AlertCircle, Clock } from 'lucide-react';

export function UnassignedTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsResponse, agentsResponse] = await Promise.all([
        api.listTickets({ page_size: 100 }),
        api.listUsers({ role: 'agent', page_size: 100 }),
      ]);

      const unassigned = ticketsResponse.items.filter(
        (ticket) => !ticket.assigned_agent_id && ticket.status !== 'closed'
      );
      setTickets(unassigned);
      setAgents(agentsResponse.items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (ticketId: string, agentId: string) => {
    if (!agentId) return;

    try {
      setAssigning(ticketId);
      await api.assignTicket(ticketId, { agent_id: agentId });
      await loadData();
      alert('Ticket assigned successfully');
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      alert('Failed to assign ticket');
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading unassigned tickets...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unassigned Queue</h1>
            <p className="text-gray-600 mt-1">
              {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} waiting for assignment
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No unassigned tickets</p>
                <p className="text-gray-400 text-sm mt-2">All tickets have been assigned to agents</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const waitingMinutes = calculateWaitingTime(ticket.created_at);
              const badgeColor = getWaitingTimeBadgeColor(waitingMinutes);

              return (
                <Card key={ticket.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Ticket Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              to={`/tickets/${ticket.id}`}
                              className="text-lg font-semibold text-blue-600 hover:underline"
                            >
                              Ticket #{ticket.id.slice(0, 8)}
                            </Link>
                            <p className="text-gray-600 mt-1">{ticket.phone_number}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="capitalize">{ticket.category}</Badge>
                            <Badge variant={badgeColor}>
                              <Clock className="h-3 w-3 mr-1" />
                              {waitingMinutes}m waiting
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p className="font-medium">{formatDate(ticket.created_at)}</p>
                          </div>
                          {ticket.merchant_id && (
                            <div>
                              <span className="text-gray-600">Merchant ID:</span>
                              <p className="font-medium">{ticket.merchant_id}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assignment Controls */}
                      <div className="lg:w-80 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign to Agent
                          </label>
                          <Select
                            onChange={(e) => handleAssign(ticket.id, e.target.value)}
                            disabled={assigning === ticket.id}
                            className="w-full"
                          >
                            <option value="">Select an agent...</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.full_name} - {agent.department || 'No dept'}
                              </option>
                            ))}
                          </Select>
                        </div>

                        {assigning === ticket.id && (
                          <div className="text-sm text-blue-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Assigning ticket...
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
