import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import type { UsageStatsResponse } from '../../types';
import {
  BarChart3,
  Users,
  MessageSquare,
  Zap,
  Headphones,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export function UsageStatsPage() {
  const [stats, setStats] = useState<UsageStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const formatDateString = (date: Date) =>
      date.toISOString().split('T')[0];

    setStartDate(formatDateString(sevenDaysAgo));
    setEndDate(formatDateString(today));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadStats();
    }
  }, [startDate, endDate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsageStats(startDate, endDate);
      setStats(data);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      setError('Failed to load usage statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);
  };

  const handleLastWeekClick = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handleLastMonthClick = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const data = stats?.data;
  const overall = data?.overall_stats;
  const llm = data?.llm_tokens;
  const audio = data?.audio_processing;
  const query = data?.query_stats;
  const breakdown = data?.breakdown_by_operation;
  const apiUsage = data?.api_usage;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Statistics</h1>
          <p className="text-gray-600 mt-1">Monitor system usage and performance metrics</p>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTodayClick}
                  variant="outline"
                  size="sm"
                >
                  Today
                </Button>
                <Button
                  onClick={handleLastWeekClick}
                  variant="outline"
                  size="sm"
                >
                  Last 7 Days
                </Button>
                <Button
                  onClick={handleLastMonthClick}
                  variant="outline"
                  size="sm"
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading usage statistics...</p>
            </div>
          </div>
        ) : !stats ? null : (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overall?.total_users || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Total unique users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Messages
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overall?.total_messages || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">In + Out</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Success Rate
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overall?.response_success_rate_percent.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Response success</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    LLM Tokens
                  </CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {llm?.total_tokens?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total consumed</p>
                </CardContent>
              </Card>
            </div>

            {/* Messages Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Messages Received</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {overall?.messages_received || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Responses Sent</p>
                    <p className="text-2xl font-bold text-green-600">
                      {overall?.responses_sent || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Text Messages</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {overall?.total_text_messages || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Audio Messages</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {overall?.total_audio_messages || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Response Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {overall?.successful_responses || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {overall?.failed_responses || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {overall?.response_success_rate_percent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Query Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Query Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {query?.successful_queries || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {query?.failed_queries || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {query?.success_rate_percent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LLM Token Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  LLM Token Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Tokens</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {llm?.total_tokens?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Input Tokens</p>
                    <p className="text-2xl font-bold text-green-600">
                      {llm?.input_tokens?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Output Tokens</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {llm?.output_tokens?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg per Message</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {llm?.avg_tokens_per_message?.toFixed(0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Audio Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {audio?.total_calls || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {audio?.successful_calls || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {audio?.failed_calls || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {audio?.success_rate_percent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600">Duration (sec)</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {audio?.total_audio_duration_seconds?.toFixed(1) || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Audio Details</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Transcription Calls</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {audio?.transcription_calls || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Translation Calls</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {audio?.translation_calls || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {audio?.avg_audio_duration?.toFixed(2) || 0}s
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Breakdown by Operation */}
            {breakdown && Object.keys(breakdown).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Token Breakdown by Operation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Routing</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {breakdown?.routing?.total_tokens?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {breakdown?.routing?.avg_tokens || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Response</p>
                      <p className="text-2xl font-bold text-green-600">
                        {breakdown?.response?.total_tokens?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {breakdown?.response?.avg_tokens || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Dispute</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {breakdown?.dispute?.total_tokens?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {breakdown?.dispute?.avg_tokens || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Error</p>
                      <p className="text-2xl font-bold text-red-600">
                        {breakdown?.error?.total_tokens?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {breakdown?.error?.avg_tokens || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  External API Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Total API Calls</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {apiUsage?.total_api_calls?.toLocaleString() || 0}
                  </p>
                </div>
                {apiUsage?.endpoints_called && Object.keys(apiUsage.endpoints_called).length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Endpoints Called</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Transactions</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {apiUsage?.endpoints_called?.transactions || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                          {apiUsage?.endpoints_called?.balance || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Merchant Verify</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {apiUsage?.endpoints_called?.merchant_verify || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Period Information */}
            {data?.period && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Report Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(data.period.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(data.period.end_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
