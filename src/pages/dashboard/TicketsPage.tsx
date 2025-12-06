import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { api } from '../../lib/api';
import type { Ticket, TicketQueryParams, PaginatedResponse } from '../../types';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from 'lucide-react';

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<PaginatedResponse<Ticket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  useEffect(() => {
    loadTickets();
  }, [currentPage, statusFilter, categoryFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: TicketQueryParams = {
        page: currentPage,
        page_size: 20,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter as any;
      if (categoryFilter !== 'all') params.category = categoryFilter as any;

      const data = await api.listTickets(params);
      setTickets(data);

      // Update URL params
      const newParams = new URLSearchParams();
      newParams.set('page', currentPage.toString());
      if (statusFilter !== 'all') newParams.set('status', statusFilter);
      if (categoryFilter !== 'all') newParams.set('category', categoryFilter);
      if (searchQuery) newParams.set('search', searchQuery);
      setSearchParams(newParams);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view all tickets. Please contact an administrator.');
      } else {
        setError('Failed to load tickets');
      }
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTickets();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setCurrentPage(1);
    setSearchParams({});
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tickets</h1>
            <p className="text-gray-600 mt-1">
              {tickets ? `${tickets.total} total tickets` : 'Loading tickets...'}
            </p>
          </div>
          <Button onClick={loadTickets} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by phone, merchant ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>

                {/* Category Filter */}
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="payment">Payment</option>
                  <option value="loan">Loan</option>
                  <option value="account">Account</option>
                  <option value="technical">Technical</option>
                  <option value="general">General</option>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  Apply Filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              {tickets && `Showing ${tickets.items.length} of ${tickets.total} tickets`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !tickets ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
                <Button onClick={loadTickets} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : tickets && tickets.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No tickets found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {tickets?.items.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {ticket.phone_number}
                            </span>
                            <Badge
                              variant="outline"
                              className={getCategoryBadge(ticket.category)}
                            >
                              {ticket.category}
                            </Badge>
                            <Badge variant={getStatusBadge(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {ticket.merchant_id && (
                            <p className="text-sm text-gray-600">
                              Merchant: {ticket.merchant_id}
                            </p>
                          )}
                        </div>
                        <Link to={`/tickets/${ticket.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Agent:</span>
                          <p className="font-medium text-gray-900">
                            {ticket.assigned_agent?.full_name || 'Unassigned'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <p className="font-medium text-gray-900">
                            {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Updated:</span>
                          <p className="font-medium text-gray-900">
                            {formatDate(ticket.updated_at)}
                          </p>
                        </div>
                        {ticket.waiting_time !== undefined && (
                          <div>
                            <span className="text-gray-500">Wait Time:</span>
                            <p className="font-medium text-gray-900">
                              {Math.round(ticket.waiting_time / 60)}m
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {tickets && tickets.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Page {tickets.page} of {tickets.total_pages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === tickets.total_pages || loading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
