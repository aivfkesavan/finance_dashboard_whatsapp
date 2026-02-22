import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import type { BroadcastJob } from '../../types';
import {
  Send,
  Loader2,
  Plus,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function BroadcastPage() {
  // Compose state
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Job history
  const [jobs, setJobs] = useState<BroadcastJob[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [expandedJobDetails, setExpandedJobDetails] = useState<BroadcastJob | null>(null);

  // Feedback
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showSuccess = (msg: string) => {
    setError(null);
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    setSuccess(null);
    setError(msg);
  };

  const loadJobs = useCallback(async (page = 1) => {
    try {
      const data = await api.listBroadcastJobs(page);
      setJobs(data.jobs);
      setJobsTotal(data.total);
      setJobsPage(page);
      return data.jobs;
    } catch (err) {
      console.error('Failed to load jobs:', err);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoadingJobs(true);
      await loadJobs();
      setLoadingJobs(false);
    };
    init();
  }, [loadJobs]);

  // Poll for in-progress jobs
  useEffect(() => {
    const hasInProgress = jobs.some(j => j.status === 'in_progress' || j.status === 'pending');

    if (hasInProgress) {
      pollingRef.current = setInterval(async () => {
        const updated = await loadJobs(jobsPage);
        // Update expanded job details if still expanded
        if (expandedJob) {
          const found = updated.find((j: BroadcastJob) => j.id === expandedJob);
          if (found && (found.status === 'completed' || found.status === 'failed')) {
            const details = await api.getBroadcastStatus(found.id);
            setExpandedJobDetails(details);
          }
        }
      }, 2000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [jobs, jobsPage, expandedJob, loadJobs]);

  const handleAddRecipients = () => {
    const numbers = phoneInput
      .split(',')
      .map(n => n.trim())
      .filter(n => n && !recipients.includes(n));
    if (numbers.length > 0) {
      setRecipients(prev => [...prev, ...numbers]);
      setPhoneInput('');
    }
  };

  const handleRemoveRecipient = (phone: string) => {
    setRecipients(prev => prev.filter(p => p !== phone));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      showError('Message cannot be empty');
      return;
    }

    try {
      setSending(true);
      setError(null);

      let job: BroadcastJob;

      if (uploadFile) {
        job = await api.uploadAndSendBroadcast(message.trim(), uploadFile);
      } else {
        if (recipients.length === 0) {
          showError('Add at least one recipient or upload a file');
          return;
        }
        job = await api.createBroadcast(message.trim(), recipients);
      }

      showSuccess(`Broadcast started! Job #${job.id} - ${job.total_recipients} recipients`);
      setMessage('');
      setRecipients([]);
      setUploadFile(null);
      await loadJobs(1);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to start broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (jobId: number) => {
    try {
      await api.cancelBroadcast(jobId);
      showSuccess(`Broadcast #${jobId} cancelled`);
      await loadJobs(jobsPage);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  const handleExpand = async (jobId: number) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      setExpandedJobDetails(null);
      return;
    }
    try {
      const details = await api.getBroadcastStatus(jobId);
      setExpandedJob(jobId);
      setExpandedJobDetails(details);
    } catch {
      showError('Failed to load job details');
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <Ban className="h-4 w-4 text-gray-500" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'success',
      failed: 'destructive',
      cancelled: 'secondary',
      in_progress: 'info',
      pending: 'warning',
    };
    return <Badge variant={variants[status] as any || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
          <p className="text-gray-600 mt-1">Send custom WhatsApp messages to multiple recipients</p>
        </div>

        {/* Feedback */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Section 1: Compose Broadcast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose Broadcast
            </CardTitle>
            <CardDescription>
              Create and send a message to multiple phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Message */}
            <div className="space-y-2">
              <Label>Message Content</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-28 p-3 border border-gray-300 rounded-lg resize-y text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your broadcast message here..."
                maxLength={4096}
              />
              <p className="text-xs text-gray-400 text-right">{message.length}/4096</p>
            </div>

            {/* Recipients - manual */}
            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="flex gap-3">
                <Input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Enter comma-separated numbers (e.g., 9876543210, 9123456789)"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRecipients()}
                />
                <Button variant="outline" onClick={handleAddRecipients} disabled={!phoneInput.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Recipients list */}
            {recipients.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{recipients.length} recipient(s)</span>
                  <Button variant="ghost" size="sm" onClick={() => setRecipients([])} className="text-red-600">
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipients.map((phone) => (
                    <span
                      key={phone}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-mono"
                    >
                      {phone}
                      <button onClick={() => handleRemoveRecipient(phone)} className="text-gray-400 hover:text-red-600">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Or upload file */}
            <div className="space-y-2">
              <Label>Or Upload File</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="h-4 w-4" />
                  {uploadFile ? uploadFile.name : 'Choose CSV/Excel'}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {uploadFile && (
                  <Button variant="ghost" size="sm" onClick={() => setUploadFile(null)} className="text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
                <a
                  href={api.getBroadcastSampleCsvUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Sample CSV
                </a>
              </div>
            </div>

            {/* Send button */}
            <Button
              onClick={handleSendBroadcast}
              disabled={sending || !message.trim() || (recipients.length === 0 && !uploadFile)}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Send Broadcast
            </Button>
          </CardContent>
        </Card>

        {/* Section 2: Broadcast History */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcast History</CardTitle>
            <CardDescription>View past broadcasts and their delivery status</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingJobs ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Send className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No broadcasts sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleExpand(job.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {statusIcon(job.status)}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            #{job.id} - {job.message_content.substring(0, 60)}{job.message_content.length > 60 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.created_at ? new Date(job.created_at).toLocaleString() : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Progress */}
                        <div className="hidden sm:flex items-center gap-2 text-sm">
                          <span className="text-green-600">{job.sent_success}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-600">{job.total_recipients}</span>
                          {job.sent_failed > 0 && (
                            <span className="text-red-600">({job.sent_failed} failed)</span>
                          )}
                        </div>
                        {statusBadge(job.status)}
                        {(job.status === 'pending' || job.status === 'in_progress') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCancel(job.id); }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {expandedJob === job.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedJob === job.id && expandedJobDetails && (
                      <div className="border-t bg-gray-50 p-4 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-semibold">{expandedJobDetails.total_recipients}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Sent</p>
                            <p className="font-semibold text-green-600">{expandedJobDetails.sent_success}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Failed</p>
                            <p className="font-semibold text-red-600">{expandedJobDetails.sent_failed}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            {statusBadge(expandedJobDetails.status)}
                          </div>
                        </div>

                        {/* Progress bar */}
                        {expandedJobDetails.total_recipients > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="flex h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-green-500"
                                style={{ width: `${(expandedJobDetails.sent_success / expandedJobDetails.total_recipients) * 100}%` }}
                              />
                              <div
                                className="bg-red-500"
                                style={{ width: `${(expandedJobDetails.sent_failed / expandedJobDetails.total_recipients) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Full message */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Message</p>
                          <p className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">{expandedJobDetails.message_content}</p>
                        </div>

                        {/* Failed recipients */}
                        {expandedJobDetails.failed_recipients && expandedJobDetails.failed_recipients.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Failed Recipients</p>
                            <div className="max-h-40 overflow-y-auto bg-white rounded border">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="text-left px-3 py-2">Phone</th>
                                    <th className="text-left px-3 py-2">Error</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {expandedJobDetails.failed_recipients.map((r, i) => (
                                    <tr key={i}>
                                      <td className="px-3 py-2 font-mono">{r.phone_number}</td>
                                      <td className="px-3 py-2 text-red-600">{r.error || 'Unknown'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {jobsTotal > 20 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">
                      Page {jobsPage} of {Math.ceil(jobsTotal / 20)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={jobsPage <= 1}
                        onClick={() => loadJobs(jobsPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={jobsPage * 20 >= jobsTotal}
                        onClick={() => loadJobs(jobsPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
