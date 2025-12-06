import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { User, AgentStats, UserRole } from '../types';
import { UserPlus, Users as UsersIcon } from 'lucide-react';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string | UserRole>('');

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        api.listUsers({
          page_size: 100,
          role: (roleFilter as UserRole) || undefined,
        }),
        api.getAgentStats(),
      ]);

      setUsers(usersResponse.items);
      setAgentStats(statsResponse);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'warning';
      case 'agent': return 'info';
      default: return 'default';
    }
  };

  const getAgentStatsForUser = (userId: string) => {
    return agentStats.find((stat) => stat.agent_id === userId);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users & Agents</h1>
              <p className="text-gray-600 mt-1">Manage team members and monitor agent performance</p>
            </div>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-48"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const stats = getAgentStatsForUser(user.id);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.department || (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {stats ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(stats.utilization, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium min-w-[3rem] text-right">
                                  {Math.round(stats.utilization)}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {stats.active_tickets} / {stats.capacity} tickets
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                user.is_active && stats?.is_available
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }`}
                            />
                            <span className="text-sm">
                              {user.is_active
                                ? stats?.is_available
                                  ? 'Available'
                                  : 'Busy'
                                : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Agent Performance Summary */}
        {agentStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentStats.map((stat) => (
                  <div
                    key={stat.agent_id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{stat.agent_name}</p>
                        <p className="text-sm text-gray-600">{stat.department || 'No dept'}</p>
                      </div>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          stat.is_available ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Tickets:</span>
                        <span className="font-medium">{stat.active_tickets}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Resolved:</span>
                        <span className="font-medium">{stat.total_resolved}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilization:</span>
                        <span className="font-medium text-blue-600">
                          {Math.round(stat.utilization)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(stat.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
