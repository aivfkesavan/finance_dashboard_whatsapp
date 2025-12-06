import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
  Calendar,
  Users,
  UserCheck,
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
        setError('You do not have permission to view users.');
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

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('91') && phone.length === 12) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  const getInitials = (name: string | undefined, phone: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return phone.slice(-2);
  };

  // Stats
  const merchantCount = users.filter(u => u.is_merchant).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} registered users</p>
          </div>
          <Button 
            onClick={loadUsers} 
            variant="outline" 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Store className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{merchantCount}</p>
                <p className="text-xs text-gray-500">Merchants</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{total - merchantCount}</p>
                <p className="text-xs text-gray-500">Regular Users</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <Card className="bg-white border border-gray-100">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by phone or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={merchantFilter}
                  onChange={(e) => {
                    setMerchantFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="true">Merchants</option>
                  <option value="false">Non-Merchants</option>
                </select>
                
                <Button type="submit" disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-100">
            <CardContent className="py-12 text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadUsers} variant="outline" className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card className="bg-gray-50 border-gray-100">
            <CardContent className="py-16 text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card 
                key={user.id} 
                className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
                      user.is_merchant 
                        ? 'bg-emerald-500' 
                        : 'bg-blue-500'
                    }`}>
                      {getInitials(user.name, user.phone_number)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900">
                          {user.name || formatPhoneNumber(user.phone_number)}
                        </h3>
                        {user.is_merchant && (
                          <Badge variant="success" className="text-xs">
                            <Store className="h-3 w-3 mr-1" />
                            Merchant
                          </Badge>
                        )}
                        {user.language_preference && (
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            {user.language_preference}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {formatPhoneNumber(user.phone_number)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(user.created_at)}
                        </span>
                        {user.merchant_id && (
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {user.merchant_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Link to={`/whatsapp-users/${user.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Conversations
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
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
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
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
