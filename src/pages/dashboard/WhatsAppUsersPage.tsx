import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import type { WhatsAppUser } from '../../types';
import {
  Phone,
  Search,
  RefreshCw,
  MessageSquare,
  Store,
  User,
  Globe,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export function WhatsAppUsersPage() {
  const [users, setUsers] = useState<WhatsAppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadUsers();
  }, [currentPage, merchantFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (merchantFilter === 'true') params.is_merchant = true;
      if (merchantFilter === 'false') params.is_merchant = false;

      const response = await api.listWhatsAppUsers(params);
      setUsers(response.users || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view WhatsApp users.');
      } else {
        setError('Failed to load users');
      }
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setMerchantFilter('all');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as +91 XXXXX XXXXX
    if (phone.startsWith('91') && phone.length === 12) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">
              {total} {total === 1 ? 'user' : 'users'} registered
            </p>
          </div>
          <Button onClick={loadUsers} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search by Phone or Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="e.g., 917299859147 or Kesavan"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Merchant Filter */}
                <div>
                  <Label htmlFor="merchant_filter">User Type</Label>
                  <Select
                    id="merchant_filter"
                    value={merchantFilter}
                    onChange={(e) => {
                      setMerchantFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="true">Merchants Only</option>
                    <option value="false">Non-Merchants</option>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleResetFilters}>
                  Reset Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              All WhatsApp users who have interacted with the bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadUsers} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No users found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                            user.is_merchant 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {user.is_merchant ? (
                              <Store className="h-6 w-6" />
                            ) : (
                              <User className="h-6 w-6" />
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-gray-900">
                                {user.name || formatPhoneNumber(user.phone_number)}
                              </h3>
                              {user.is_merchant && (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <Store className="h-3 w-3" />
                                  Merchant
                                </Badge>
                              )}
                              {user.language_preference && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {user.language_preference}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-medium">Phone:</span>
                                <span className="font-mono">{formatPhoneNumber(user.phone_number)}</span>
                              </div>
                              
                              {user.merchant_id && (
                                <div>
                                  <span className="font-medium">Merchant ID:</span>{' '}
                                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                    {user.merchant_id}
                                  </span>
                                </div>
                              )}

                              <div>
                                <span className="font-medium">Joined:</span>{' '}
                                {formatDate(user.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <Link to={`/whatsapp-users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View Conversations
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} users
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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

