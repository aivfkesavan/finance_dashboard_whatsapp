import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { TicketDetails, User, TicketStatus } from '../types';
import { ArrowLeft, User as UserIcon, Clock, CheckCircle } from 'lucide-react';

export function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('open');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id) {
      loadTicket();
      loadAgents();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await api.getTicket(id!);
      setTicket(data);
      setSelectedStatus(data.status);
      setResolutionNotes(data.resolution_notes || '');
      setSelectedAgent(data.assigned_agent_id ? String(data.assigned_agent_id) : '');
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await api.listUsers({ role: 'agent', page_size: 100 });
      setAgents(response.items);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!ticket) return;

    try {
      setSaving(true);
      await api.updateTicketStatus(ticket.id, {
        status: selectedStatus,
        resolution_notes: resolutionNotes || undefined,
      });
      await loadTicket();
      alert('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!ticket || !selectedAgent) return;

    try {
      setSaving(true);
      await api.assignTicket(ticket.id, { agent_id: selectedAgent });
      await loadTicket();
      alert('Agent assigned successfully');
    } catch (error) {
      console.error('Failed to assign agent:', error);
      alert('Failed to assign agent');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!ticket || !newNote.trim()) return;

    try {
      setSaving(true);
      await api.addTicketNote(ticket.id, { note: newNote });
      setNewNote('');
      await loadTicket();
      alert('Note added successfully');
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note');
    } finally {
      setSaving(false);
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
            <p className="mt-4 text-gray-600">Loading ticket...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Ticket not found</p>
          <Button onClick={() => navigate('/tickets')} className="mt-4">
            Back to Tickets
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Ticket #{ticket.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Created {formatDate(ticket.created_at)}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(ticket.status)}>
            {ticket.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Phone Number</Label>
                <p className="font-medium">{ticket.phone_number}</p>
              </div>
              {ticket.merchant_id && (
                <div>
                  <Label className="text-gray-600">Merchant ID</Label>
                  <p className="font-medium">{ticket.merchant_id}</p>
                </div>
              )}
              <div>
                <Label className="text-gray-600">Category</Label>
                <Badge className="capitalize mt-1">{ticket.category}</Badge>
              </div>
              <div>
                <Label className="text-gray-600">Created At</Label>
                <p className="text-sm">{formatDate(ticket.created_at)}</p>
              </div>
              {ticket.resolved_at && (
                <div>
                  <Label className="text-gray-600">Resolved At</Label>
                  <p className="text-sm">{formatDate(ticket.resolved_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Status Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                  className="mt-1"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>

              {(selectedStatus === 'resolved' || selectedStatus === 'closed') && (
                <div>
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution notes..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              <Button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Agent Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Agent</Label>
                <p className="mt-1 font-medium">
                  {ticket.assigned_agent?.full_name || (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </p>
              </div>

              <div>
                <Label>Assign to Agent</Label>
                <Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="mt-1"
                >
                  <option value="">Select an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                onClick={handleAssignAgent}
                disabled={saving || !selectedAgent}
                className="w-full"
              >
                {saving ? 'Assigning...' : 'Assign Agent'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Conversation History */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.conversation_history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No conversation yet</p>
              ) : (
                ticket.conversation_history.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-50 ml-12'
                        : 'bg-gray-50 mr-12'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{message.sender}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-900">{message.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.activity_log.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity yet</p>
              ) : (
                ticket.activity_log.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                      {index < ticket.activity_log.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        by {activity.action_by_name || activity.action_by}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Internal Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note..."
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="mt-2"
              >
                {saving ? 'Adding...' : 'Add Note'}
              </Button>
            </div>

            <div className="space-y-3">
              {ticket.internal_notes?.map((note) => (
                <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{note.note}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    by {note.created_by_name || note.created_by} •{' '}
                    {formatDate(note.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
