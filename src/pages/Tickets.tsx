import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { Ticket, TicketStatus, TicketCategory, PaginatedResponse } from '../types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function Tickets() {
  const [tickets, setTickets] = useState<PaginatedResponse<Ticket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | ''>('');

  useEffect(() => {
    loadTickets();
  }, [page, statusFilter, categoryFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.listTickets({
        page,
        page_size: 20,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
      });
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTickets();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tickets</h1>
          <p className="text-gray-600 mt-1">View and manage all customer support tickets</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by ticket ID or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>

              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TicketStatus | '');
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>

              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as TicketCategory | '');
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>
                <option value="payment">Payment</option>
                <option value="loan">Loan</option>
                <option value="account">Account</option>
                <option value="technical">Technical</option>
                <option value="general">General</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading tickets...</p>
                </div>
              </div>
            ) : tickets?.items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No tickets found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets?.items.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="text-blue-600 hover:underline font-mono"
                          >
                            #{ticket.id.slice(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.phone_number}</p>
                            {ticket.merchant_id && (
                              <p className="text-sm text-gray-500">ID: {ticket.merchant_id}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="capitalize">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.assigned_agent?.full_name || (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(ticket.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {tickets && tickets.total_pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing page {tickets.page} of {tickets.total_pages} ({tickets.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= tickets.total_pages}
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
