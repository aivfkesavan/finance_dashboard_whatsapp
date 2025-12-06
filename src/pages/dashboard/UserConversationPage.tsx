import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import type { WhatsAppUserDetails, WhatsAppUserConversation } from '../../types';
import {
  ArrowLeft,
  Phone,
  Store,
  User,
  Globe,
  MessageSquare,
  Mic,
  Bot,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Target,
  Database,
  FileAudio,
  Volume2,
  Languages,
  Ticket,
  Cpu,
  Activity,
  Code,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function UserConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<WhatsAppUserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});
  const [showTranscription, setShowTranscription] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (userId) {
      loadUserConversations();
    }
  }, [userId]);

  const loadUserConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWhatsAppUserConversations(Number(userId), { limit: 100 });
      setUserDetails(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this user\'s conversations.');
      } else if (err.response?.status === 404) {
        setError('User not found.');
      } else {
        setError('Failed to load conversations');
      }
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (messageId: number) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const toggleTranscription = (messageId: number) => {
    setShowTranscription(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('91') && phone.length === 12) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  const renderMetadata = (message: WhatsAppUserConversation) => {
    const hasRouting = message.routing?.decision;
    const hasOrchestrator = message.orchestrator;
    const hasApiInfo = message.api_info;

    if (!hasRouting && !hasOrchestrator && !hasApiInfo) return null;

    return (
      <div className="mt-3 space-y-3">
        {/* Routing Info */}
        {hasRouting && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Routing Decision</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {message.routing?.decision?.intent && (
                <div>
                  <span className="text-purple-600 font-medium">Intent:</span>{' '}
                  <Badge variant="outline" className="text-[10px] bg-purple-100 border-purple-300">
                    {message.routing.decision.intent}
                  </Badge>
                </div>
              )}
              {message.routing?.decision?.service && (
                <div>
                  <span className="text-purple-600 font-medium">Service:</span>{' '}
                  <span className="font-mono text-purple-800">{message.routing.decision.service}</span>
                </div>
              )}
              {message.routing?.decision?.endpoint && (
                <div>
                  <span className="text-purple-600 font-medium">Endpoint:</span>{' '}
                  <span className="font-mono text-purple-800">{message.routing.decision.endpoint}</span>
                </div>
              )}
              {message.routing?.decision?.confidence && (
                <div>
                  <span className="text-purple-600 font-medium">Confidence:</span>{' '}
                  <span className="font-bold text-purple-800">{(message.routing.decision.confidence * 100).toFixed(1)}%</span>
                </div>
              )}
              {message.routing?.decision?.action && (
                <div>
                  <span className="text-purple-600 font-medium">Action:</span>{' '}
                  <span className="text-purple-800">{message.routing.decision.action}</span>
                </div>
              )}
              {message.routing?.decision?.reason && (
                <div className="col-span-2">
                  <span className="text-purple-600 font-medium">Reason:</span>{' '}
                  <span className="text-purple-800">{message.routing.decision.reason}</span>
                </div>
              )}
            </div>
            {(message.routing?.merchant_check_performed || message.routing?.merchant_check) && (
              <div className="mt-2 pt-2 border-t border-purple-200 text-xs">
                <span className="text-purple-600 font-medium">Merchant Check:</span>{' '}
                {message.routing.merchant_exists ? (
                  <Badge variant="success" className="text-[10px]">Verified Merchant</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Not a Merchant</Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Orchestrator Info */}
        {hasOrchestrator && (
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Orchestrator</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {message.orchestrator?.flow && (
                <div>
                  <span className="text-cyan-600 font-medium">Flow:</span>{' '}
                  <Badge variant="outline" className="text-[10px] bg-cyan-100 border-cyan-300">
                    {message.orchestrator.flow}
                  </Badge>
                </div>
              )}
              {message.orchestrator?.processing_time_ms && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-cyan-500" />
                  <span className="text-cyan-600 font-medium">Time:</span>{' '}
                  <span className="font-mono text-cyan-800">{message.orchestrator.processing_time_ms}ms</span>
                </div>
              )}
            </div>
            {message.orchestrator?.tokens && (
              <div className="mt-2 pt-2 border-t border-cyan-200">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-cyan-500" />
                  <span className="text-xs text-cyan-600 font-medium">Token Usage:</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-cyan-600">Input:</span>{' '}
                    <span className="font-mono font-bold text-cyan-800">{message.orchestrator.tokens.input}</span>
                  </div>
                  <div>
                    <span className="text-cyan-600">Output:</span>{' '}
                    <span className="font-mono font-bold text-cyan-800">{message.orchestrator.tokens.output}</span>
                  </div>
                  <div>
                    <span className="text-cyan-600">Total:</span>{' '}
                    <span className="font-mono font-bold text-cyan-800">{message.orchestrator.tokens.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Info */}
        {hasApiInfo && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">API Call</span>
              {message.api_info?.success !== undefined && (
                message.api_info.success ? (
                  <Badge variant="success" className="text-[10px]">Success</Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                )
              )}
            </div>
            {message.api_info?.endpoints_called && message.api_info.endpoints_called.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-amber-600 font-medium">Endpoints:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.api_info.endpoints_called.map((endpoint, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] font-mono bg-amber-100 border-amber-300">
                      {endpoint}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {message.api_info?.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                <span className="font-medium">Error:</span> {message.api_info.error}
              </div>
            )}
            {message.api_info?.response_data && (
              <details className="mt-2">
                <summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-800 flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  View Response Data
                </summary>
                <pre className="mt-2 p-2 bg-amber-100 rounded text-[10px] overflow-x-auto max-h-40">
                  {JSON.stringify(message.api_info.response_data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate('/whatsapp-users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadUserConversations} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!userDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-24 text-gray-500">
          <p>User not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { user, conversations, total_messages, tickets } = userDetails;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate('/whatsapp-users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold ${
                  user.is_merchant 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  {user.is_merchant ? (
                    <Store className="h-8 w-8" />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>

                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.name || formatPhoneNumber(user.phone_number)}
                    {user.is_merchant && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Store className="h-3 w-3" />
                        Merchant
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {formatPhoneNumber(user.phone_number)}
                      </span>
                      {user.language_preference && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {user.language_preference}
                        </span>
                      )}
                      {user.merchant_id && (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          ID: {user.merchant_id}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </div>
              </div>

              <Button onClick={loadUserConversations} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Messages</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{total_messages}</p>
              </div>
              
              {tickets && tickets.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Ticket className="h-4 w-4" />
                    <span className="text-sm font-medium">Tickets</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{tickets.length}</p>
                </div>
              )}

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className="text-lg font-bold text-green-700">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Tickets */}
        {tickets && tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Related Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tickets.map((ticket: any) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          ticket.status === 'open' ? 'warning' :
                          ticket.status === 'in_progress' ? 'info' :
                          ticket.status === 'resolved' ? 'success' : 'secondary'
                        }>
                          {ticket.status}
                        </Badge>
                        <span className="font-mono text-sm">{ticket.ticket_id}</span>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation History
              <Badge variant="secondary" className="ml-2">
                {conversations.length} messages
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete conversation log with AI processing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="max-h-[800px] overflow-y-auto pr-2 space-y-4">
                {conversations.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      {/* Header */}
                      <div className={`flex items-center gap-2 mb-1 flex-wrap ${message.role === 'user' ? 'justify-end' : ''}`}>
                        <span className="text-xs font-medium text-gray-900 capitalize">
                          {message.role === 'assistant' ? 'AI Assistant' : 'User'}
                        </span>

                        {/* Message Type Badge */}
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

                        {/* Language Badge */}
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
                          {formatDate(message.timestamp)}
                        </span>
                      </div>

                      {/* Audio Player */}
                      {message.message_type === 'audio' && message.audio?.file_url && (
                        <div className={`mb-2 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
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

                      {/* Message Bubble */}
                      <div
                        className={`inline-block p-3 rounded-lg text-left ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className={`text-sm prose prose-sm max-w-none ${
                          message.role === 'user' ? 'prose-invert' : ''
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
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Transcription Button */}
                      {message.message_type === 'audio' && message.audio?.transcription && (
                        <div className={`mt-2 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTranscription(message.id)}
                            className={`text-xs h-auto px-2 py-1 rounded-md ${
                              showTranscription[message.id]
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            {showTranscription[message.id] ? 'Hide Transcription' : 'View Transcription'}
                            {showTranscription[message.id] ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                          </Button>
                        </div>
                      )}

                      {/* Transcription Content */}
                      {message.message_type === 'audio' && message.audio?.transcription && showTranscription[message.id] && (
                        <div className={`mt-2 p-3 rounded-lg border ${
                          message.role === 'user'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } text-left`}>
                          <div className={`text-[10px] uppercase tracking-wide mb-1 ${
                            message.role === 'user' ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            <Volume2 className="h-3 w-3 inline mr-1" />
                            Original Transcription
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.audio.transcription}</p>
                        </div>
                      )}

                      {/* Response Language */}
                      {message.role === 'assistant' && message.language?.response && (
                        <p className="text-xs text-gray-500 mt-1">
                          <Globe className="h-3 w-3 inline mr-1" />
                          Response in {message.language.response}
                        </p>
                      )}

                      {/* Expand/Collapse Details Button */}
                      {(message.routing || message.orchestrator || message.api_info) && (
                        <div className={`mt-2 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(message.id)}
                            className="text-xs h-auto px-2 py-1 text-gray-500 hover:text-gray-700"
                          >
                            <Activity className="h-3 w-3 mr-1" />
                            {expandedMessages[message.id] ? 'Hide' : 'Show'} AI Processing Details
                            {expandedMessages[message.id] ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                          </Button>
                        </div>
                      )}

                      {/* Expanded Metadata */}
                      {expandedMessages[message.id] && renderMetadata(message)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

