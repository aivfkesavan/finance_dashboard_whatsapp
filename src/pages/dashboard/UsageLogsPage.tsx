import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../lib/api';
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';

interface UsageLog {
  id: number;
  user_phone: string;
  service_type: string;
  operation: string;
  started_at: string;
  completed_at: string;
  latency_ms: number;
  status: string;
  audio_duration_seconds?: number;
  total_tokens?: number;
  retry_count: number;
  error_type?: string;
}

interface UsageSummary {
  total_logs: number;
  by_service: {
    [key: string]: {
      count: number;
      success_count: number;
      failure_count: number;
    };
  };
  last_updated: string;
}

export function UsageLogsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total_pages: 1 });

  // Filters
  const [serviceType, setServiceType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadData();
  }, [pagination.page, serviceType, statusFilter, userPhone, fromDate, toDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter params
      const filterParams = {
        service_type: serviceType || undefined,
        status_filter: statusFilter || undefined,
        user_phone: userPhone || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Remove undefined values
      const params = Object.fromEntries(
        Object.entries(filterParams).filter(([, value]) => value !== undefined)
      );

      const [logsData, summaryData] = await Promise.all([
        api.getUsageLogs(params as any),
        api.getUsageSummary({
          service_type: serviceType || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        } as any),
      ]);

      setLogs(logsData.logs || []);
      setSummary(summaryData);
      if (logsData.pagination) {
        setPagination(logsData.pagination);
      }
    } catch (err) {
      setError('Failed to load usage logs');
      console.error('Error loading usage logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setServiceType('');
    setStatusFilter('');
    setUserPhone('');
    setFromDate('');
    setToDate('');
    setPagination({ page: 1, limit: 50, total_pages: 1 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failure':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'partial':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'stt':
        return 'bg-blue-50 text-blue-700';
      case 'llm':
        return 'bg-purple-50 text-purple-700';
      case 'payment_api':
        return 'bg-orange-50 text-orange-700';
      case 'messaging_api':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'User Phone',
      'Service',
      'Operation',
      'Status',
      'Latency (ms)',
      'Started At',
      'Error Type',
    ];
    const rows = logs.map((log) => [
      log.id,
      log.user_phone,
      log.service_type,
      log.operation,
      log.status,
      log.latency_ms,
      log.started_at,
      log.error_type || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usage-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading && logs.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && logs.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadData} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Usage Logs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor API usage and performance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Logs</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {summary.total_logs.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {Object.entries(summary.by_service).map(([service, data]) => (
              <Card key={service} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${getServiceColor(service)}`}>
                      {service.replace('_', ' ')}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{data.count}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {data.success_count} success • {data.failure_count} failure
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => {
                    setServiceType(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Services</option>
                  <option value="stt">STT</option>
                  <option value="llm">LLM</option>
                  <option value="payment_api">Payment API</option>
                  <option value="messaging_api">Messaging API</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  User Phone
                </label>
                <Input
                  type="text"
                  placeholder="919876543210"
                  value={userPhone}
                  onChange={(e) => {
                    setUserPhone(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="text-sm"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-medium text-gray-900">Usage Logs</h2>
          </div>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="py-12 text-center">
                <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No usage logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Operation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Latency
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Started
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {log.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.user_phone}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getServiceColor(log.service_type)}>
                            {log.service_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.operation}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={getStatusColor(log.status)}
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDuration(log.latency_ms)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(log.started_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={pagination.page === 1 || loading}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.min(pagination.total_pages, pagination.page + 1),
                })
              }
              disabled={pagination.page === pagination.total_pages || loading}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
