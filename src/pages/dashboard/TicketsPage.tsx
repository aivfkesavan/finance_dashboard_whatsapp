import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../lib/api';
import type { Ticket, TicketQueryParams, PaginatedResponse } from '../../types';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Ticket as TicketIcon,
  Filter,
  X,
} from 'lucide-react';

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<PaginatedResponse<Ticket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

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

      const newParams = new URLSearchParams();
      newParams.set('page', currentPage.toString());
      if (statusFilter !== 'all') newParams.set('status', statusFilter);
      if (categoryFilter !== 'all') newParams.set('category', categoryFilter);
      if (searchQuery) newParams.set('search', searchQuery);
      setSearchParams(newParams);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {tickets ? `${tickets.total} tickets` : 'Loading...'}
            </p>
          </div>
          <Button onClick={loadTickets} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by phone or merchant ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-gray-100' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button type="submit" disabled={loading}>
                  Search
                </Button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="payment">Payment</option>
                    <option value="loan">Loan</option>
                    <option value="account">Account</option>
                    <option value="technical">Technical</option>
                    <option value="general">General</option>
                  </select>

                  <Button type="button" variant="ghost" size="sm" onClick={handleResetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {loading && !tickets ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">{error}</p>
              <Button onClick={loadTickets} variant="outline" className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : tickets && tickets.items.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="py-16 text-center">
              <TicketIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tickets found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets?.items.map((ticket) => (
              <Card key={ticket.id} className="bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <TicketIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{ticket.phone_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(ticket.category)}`}>
                            {ticket.category}
                          </span>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{ticket.assigned_agent?.full_name || 'Unassigned'}</span>
                          <span>•</span>
                          <span>{formatDate(ticket.created_at)}</span>
                          {ticket.merchant_id && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">{ticket.merchant_id}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link to={`/tickets/${ticket.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {tickets && tickets.total_pages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Page {tickets.page} of {tickets.total_pages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === tickets.total_pages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
