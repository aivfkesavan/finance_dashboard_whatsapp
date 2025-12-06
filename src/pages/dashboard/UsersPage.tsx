import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { User, CreateUserRequest, UpdateUserRequest, UserRole } from '../../types';
import {
  UserPlus,
  Users,
  RefreshCw,
  CheckCircle,
  Shield,
  Briefcase,
  Pencil,
  X,
  Save,
  Mail,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'agent',
    department: undefined,
    agent_capacity: undefined,
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, departmentFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.listUsers({
        role: roleFilter as UserRole | undefined,
        department: departmentFilter || undefined,
        page_size: 100,
      });
      setUsers(response?.items || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.createUser({
        ...formData,
        department: formData.role === 'agent' ? formData.department : undefined,
        agent_capacity: formData.role === 'agent' ? formData.agent_capacity : undefined,
      });
      setFormData({ username: '', email: '', password: '', full_name: '', role: 'agent', department: undefined, agent_capacity: undefined });
      setShowCreateForm(false);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({ email: user.email, full_name: user.full_name, department: user.department || undefined, is_active: user.is_active });
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      setUpdating(true);
      await api.updateUser(userId, editFormData);
      setEditingUserId(null);
      setEditFormData({});
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const canCreateUser = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const canEditUser = (user: User) => {
    if (currentUser?.role === 'super_admin') return user.role !== 'super_admin' || user.id !== currentUser.id;
    if (currentUser?.role === 'admin') return user.role === 'agent';
    return false;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-50 text-red-700 border-red-200';
      case 'admin': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'agent': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    agents: users.filter(u => u.role === 'agent').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
            <p className="text-sm text-gray-500 mt-0.5">{stats.total} members</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadUsers} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canCreateUser && (
              <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.agents}</p>
                <p className="text-xs text-gray-500">Agents</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Form */}
        {showCreateForm && canCreateUser && (
          <Card className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-medium text-gray-900">Add New Member</h2>
            </div>
            <CardContent className="p-4">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Full Name *</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Username *</Label>
                    <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Password *</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Role *</Label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'agent' })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md">
                      {currentUser?.role === 'super_admin' && <option value="admin">Admin</option>}
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                  {formData.role === 'agent' && (
                    <div className="space-y-1.5">
                      <Label className="text-sm">Department</Label>
                      <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md">
                        <option value="">Select...</option>
                        <option value="payment">Payment</option>
                        <option value="loan">Loan</option>
                        <option value="account">Account</option>
                        <option value="technical">Technical</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={creating} size="sm">
                    {creating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Create
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white">
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
              </select>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white">
                <option value="">All Departments</option>
                <option value="payment">Payment</option>
                <option value="loan">Loan</option>
                <option value="account">Account</option>
                <option value="technical">Technical</option>
                <option value="general">General</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">{error}</p>
              <Button onClick={loadUsers} variant="outline" className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="py-16 text-center">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const isEditing = editingUserId === user.id;

              return (
                <Card key={user.id} className={`bg-white border ${isEditing ? 'border-blue-300' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Editing: {user.username}</span>
                          <Button variant="ghost" size="sm" onClick={() => setEditingUserId(null)} className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Email</Label>
                            <Input value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="h-9" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Full Name</Label>
                            <Input value={editFormData.full_name || ''} onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })} className="h-9" />
                          </div>
                          {user.role === 'agent' && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Department</Label>
                              <select value={editFormData.department || ''} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md">
                                <option value="">Select...</option>
                                <option value="payment">Payment</option>
                                <option value="loan">Loan</option>
                                <option value="account">Account</option>
                                <option value="technical">Technical</option>
                                <option value="general">General</option>
                              </select>
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <Label className="text-xs">Status</Label>
                            <select value={editFormData.is_active ? 'true' : 'false'} onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md">
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateUser(user.id)} disabled={updating} size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            {updating ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingUserId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{user.full_name}</span>
                            <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                            {user.is_active ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500 border-gray-200">Inactive</Badge>
                            )}
                            {user.department && (
                              <span className="text-xs text-gray-500 capitalize">{user.department}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {canEditUser(user) && (
                          <Button variant="ghost" size="sm" onClick={() => startEditing(user)} className="text-gray-500">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
