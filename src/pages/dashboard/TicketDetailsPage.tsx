import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { api } from '../../lib/api';
import type { TicketDetails, User, TicketStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  User as UserIcon,
  Bot,
  MessageSquare,
  Clock,
  History,
  StickyNote,
  Send,
  RefreshCw,
  Mic,
  Volume2,
  Globe,
  Languages,
  FileAudio,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTranscriptions, setExpandedTranscriptions] = useState<Set<string>>(new Set());

  const toggleTranscription = (messageId: string) => {
    setExpandedTranscriptions(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  // Action states
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('open');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicketDetails();
      loadAgents();
    }
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
      if (ticket.assigned_agent_id) {
        setSelectedAgent(String(ticket.assigned_agent_id));
      }
    }
  }, [ticket]);

  const loadTicketDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getTicket(id);
      setTicket(data);
    } catch (err) {
      setError('Failed to load ticket details');
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await api.listUsers({ role: 'agent', is_active: true, page_size: 100 });
      setAgents(response?.items || []);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };

  const handleAssignAgent = async () => {
    if (!id || !selectedAgent) return;

    try {
      setActionLoading(true);
      await api.assignTicket(id, { agent_id: selectedAgent });
      await loadTicketDetails();
    } catch (err) {
      console.error('Error assigning agent:', err);
      alert('Failed to assign agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      await api.updateTicketStatus(id, {
        status: selectedStatus,
        resolution_notes: selectedStatus === 'resolved' ? resolutionNotes : undefined,
      });
      await loadTicketDetails();
      setResolutionNotes('');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!id || !internalNote.trim()) return;

    try {
      setActionLoading(true);
      await api.addTicketNote(id, { note: internalNote });
      await loadTicketDetails();
      setInternalNote('');
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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

  if (error || !ticket) {
    return (
      <DashboardLayout>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Error Loading Ticket</CardTitle>
            <CardDescription className="text-red-700">
              {error || 'Ticket not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/tickets')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Button>
              <Button onClick={loadTicketDetails} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/tickets')} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket Details</h1>
              <p className="text-gray-600 mt-1">{ticket.phone_number}</p>
            </div>
          </div>
          <Button onClick={loadTicketDetails} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ticket Information</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getCategoryBadge(ticket.category || 'general')}>
                      {ticket.category || 'general'}
                    </Badge>
                    <Badge variant={getStatusBadge(ticket.status || 'open')}>
                      {(ticket.status || 'open').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Phone Number</dt>
                    <dd className="text-sm font-medium text-gray-900">{ticket.phone_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Merchant ID</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {ticket.merchant_id || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Assigned Agent</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {ticket.assigned_agent?.full_name || 'Unassigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatTimestamp(ticket.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatTimestamp(ticket.updated_at)}
                    </dd>
                  </div>
                  {ticket.resolved_at && (
                    <div>
                      <dt className="text-sm text-gray-500">Resolved</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {formatTimestamp(ticket.resolved_at)}
                      </dd>
                    </div>
                  )}
                </dl>
                {ticket.resolution_notes && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-1">Resolution Notes</p>
                    <p className="text-sm text-green-800">{ticket.resolution_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation History
                  {ticket.conversation_history && ticket.conversation_history.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {ticket.conversation_history.length} messages
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                  {(!ticket.conversation_history || ticket.conversation_history.length === 0) ? (
                    <p className="text-center text-gray-500 py-8">No messages yet</p>
                  ) : (
                    ticket.conversation_history.map((message: any, index: number) => (
                      <div
                        key={message.id || index}
                        className={`flex gap-3 ${
                          message.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender === 'user'
                              ? 'bg-blue-100'
                              : message.sender === 'bot'
                              ? 'bg-purple-100'
                              : 'bg-green-100'
                          }`}
                        >
                          {message.sender === 'user' ? (
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          ) : message.sender === 'bot' ? (
                            <Bot className="h-4 w-4 text-purple-600" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div
                          className={`flex-1 max-w-[85%] ${
                            message.sender === 'user' ? 'text-right' : ''
                          }`}
                        >
                          {/* Message header with sender, time, and badges */}
                          <div className={`flex items-center gap-2 mb-1 flex-wrap ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            <span className="text-xs font-medium text-gray-900 capitalize">
                              {message.sender === 'bot' ? 'Assistant' : message.sender}
                            </span>
                            
                            {/* Message type badge */}
                            {message.message_type && (
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-1.5 py-0 ${
                                  message.message_type === 'audio' 
                                    ? 'bg-orange-50 text-orange-700 border-orange-200' 
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                }`}
                              >
                                {message.message_type === 'audio' ? (
                                  <><Mic className="h-2.5 w-2.5 mr-0.5" /> Audio</>
                                ) : (
                                  'Text'
                                )}
                              </Badge>
                            )}
                            
                            {/* Language badge */}
                            {message.language?.detected && (
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200"
                              >
                                <Languages className="h-2.5 w-2.5 mr-0.5" />
                                {message.language.detected}
                              </Badge>
                            )}
                            
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          
                          {/* Audio player for audio messages */}
                          {message.message_type === 'audio' && message.audio?.file_url && (
                            <div className={`mb-2 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                                <FileAudio className="h-4 w-4 text-orange-600" />
                                <audio 
                                  controls 
                                  className="h-8 max-w-[250px]"
                                  preload="metadata"
                                >
                                  <source 
                                    src={`${API_URL}${message.audio.file_url}`} 
                                    type="audio/ogg" 
                                  />
                                  Your browser does not support audio.
                                </audio>
                              </div>
                            </div>
                          )}
                          
                          {/* Message content */}
                          <div
                            className={`inline-block p-3 rounded-lg text-left ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className={`text-sm prose prose-sm max-w-none ${
                              message.sender === 'user' 
                                ? 'prose-invert' 
                                : ''
                            }`}>
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                  li: ({ children }) => <li className="mb-1">{children}</li>,
                                }}
                              >
                                {message.message || ''}
                              </ReactMarkdown>
                            </div>
                          </div>
                          
                          {/* Transcription button for audio messages */}
                          {message.message_type === 'audio' && message.audio?.transcription && (
                            <div className={`mt-2 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                              <button
                                onClick={() => toggleTranscription(message.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                  expandedTranscriptions.has(message.id)
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                <FileText className="h-3 w-3" />
                                {expandedTranscriptions.has(message.id) ? 'Hide' : 'View'} Transcription
                                {expandedTranscriptions.has(message.id) ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                              
                              {/* Expanded transcription */}
                              {expandedTranscriptions.has(message.id) && (
                                <div className={`mt-2 p-2.5 rounded-lg border text-left text-sm ${
                                  message.sender === 'user'
                                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                                    : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                }`}>
                                  <div className="text-[10px] uppercase tracking-wide mb-1 text-indigo-500 flex items-center gap-1">
                                    <Volume2 className="h-3 w-3" />
                                    Original Transcription
                                  </div>
                                  {message.audio.transcription}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Response language indicator for assistant messages */}
                          {message.sender === 'bot' && message.language?.response && (
                            <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Response in {message.language.response}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(!ticket.activity_log || ticket.activity_log.length === 0) ? (
                    <p className="text-center text-gray-500 py-8">No activity yet</p>
                  ) : (
                    ticket.activity_log.map((activity) => (
                      <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{activity.action_by_name || activity.action_by}</span>
                            <span>•</span>
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            {ticket.internal_notes && ticket.internal_notes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ticket.internal_notes.map((note) => (
                      <div key={note.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-900 mb-2">{note.note}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{note.created_by_name || note.created_by}</span>
                          <span>•</span>
                          <span>{formatTimestamp(note.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions - Right Side */}
          <div className="space-y-6">
            {/* Assign Agent */}
            {(user?.role === 'super_admin' || user?.role === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle>Assign Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Agent</Label>
                    <Select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                    >
                      <option value="">Choose agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignAgent}
                    disabled={!selectedAgent || actionLoading}
                    className="w-full"
                  >
                    Assign Agent
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Select>
                </div>
                {selectedStatus === 'resolved' && (
                  <div>
                    <Label>Resolution Notes</Label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution notes..."
                      rows={4}
                    />
                  </div>
                )}
                <Button
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                  className="w-full"
                >
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Add Internal Note */}
            <Card>
              <CardHeader>
                <CardTitle>Add Internal Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Note</Label>
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add a note for internal reference..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleAddNote}
                  disabled={!internalNote.trim() || actionLoading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
