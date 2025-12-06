import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { User, CreateUserRequest, UpdateUserRequest, UserRole } from '../../types';
import {
  UserPlus,
  Users as UsersIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
  Shield,
  UserCog,
  Briefcase,
  Pencil,
  X,
  Save,
  Mail,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
} from 'lucide-react';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Create user form
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

  // Edit user state
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
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);

      const payload: CreateUserRequest = {
        ...formData,
        department: formData.role === 'agent' ? formData.department : undefined,
        agent_capacity: formData.role === 'agent' ? formData.agent_capacity : undefined,
      };

      await api.createUser(payload);

      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'agent',
        department: undefined,
        agent_capacity: undefined,
      });
      setShowCreateForm(false);

      // Reload users
      await loadUsers();

      alert('User created successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create user';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
      email: user.email,
      full_name: user.full_name,
      department: user.department || undefined,
      is_active: user.is_active,
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      setUpdating(true);
      setError(null);

      await api.updateUser(userId, editFormData);

      // Reset edit state
      setEditingUserId(null);
      setEditFormData({});

      // Reload users
      await loadUsers();

      alert('User updated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update user';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'warning';
      case 'agent':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return Shield;
      case 'admin':
        return UserCog;
      case 'agent':
        return Briefcase;
      default:
        return UsersIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'from-red-500 to-rose-600';
      case 'admin':
        return 'from-amber-500 to-orange-600';
      case 'agent':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canCreateUser = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const canEditUser = (user: User) => {
    if (currentUser?.role === 'super_admin') {
      return user.role !== 'super_admin' || user.id !== currentUser.id;
    }
    if (currentUser?.role === 'admin') {
      return user.role === 'agent';
    }
    return false;
  };

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
    agents: users.filter((u) => u.role === 'agent').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your team members and their permissions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadUsers} variant="outline" disabled={loading} className="shadow-sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canCreateUser && (
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Members</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-200 flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Active</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.active}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-200 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Admins</p>
                  <p className="text-3xl font-bold text-amber-900">{stats.admins}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-200 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Agents</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.agents}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-200 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create User Form */}
        {showCreateForm && canCreateUser && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                Create New Team Member
              </CardTitle>
              <CardDescription className="text-blue-700">
                Add a new admin or agent to your team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-700 font-medium">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="john_doe"
                      required
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 font-medium">Role *</Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'agent' })}
                      required
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    >
                      {currentUser?.role === 'super_admin' && (
                        <option value="admin">Admin</option>
                      )}
                      <option value="agent">Agent</option>
                    </Select>
                  </div>

                  {/* Department (for agents only) */}
                  {formData.role === 'agent' && (
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-700 font-medium">Department *</Label>
                      <Select
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select department</option>
                        <option value="payment">Payment</option>
                        <option value="loan">Loan</option>
                        <option value="account">Account</option>
                        <option value="technical">Technical</option>
                        <option value="general">General</option>
                      </Select>
                    </div>
                  )}

                  {/* Agent Capacity (for agents only) */}
                  {formData.role === 'agent' && (
                    <div className="space-y-2">
                      <Label htmlFor="agent_capacity" className="text-gray-700 font-medium">Capacity</Label>
                      <Input
                        id="agent_capacity"
                        type="number"
                        value={formData.agent_capacity || ''}
                        onChange={(e) => setFormData({ ...formData, agent_capacity: parseInt(e.target.value) || undefined })}
                        placeholder="15"
                        min={1}
                        max={50}
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500">Max tickets (default: 15)</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-blue-100">
                  <Button 
                    type="submit" 
                    disabled={creating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Member
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-gray-100' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Filter by Role</Label>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white"
                  >
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Filter by Department</Label>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-white"
                  >
                    <option value="">All Departments</option>
                    <option value="payment">Payment</option>
                    <option value="loan">Loan</option>
                    <option value="account">Account</option>
                    <option value="technical">Technical</option>
                    <option value="general">General</option>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading team members...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button onClick={loadUsers} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredUsers.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No team members found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try a different search term' : 'Get started by adding your first team member'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                const isEditing = editingUserId === user.id;

                return (
                  <Card
                    key={user.id}
                    className={`transition-all duration-200 ${
                      isEditing 
                        ? 'border-2 border-blue-400 shadow-lg shadow-blue-500/10 bg-blue-50/50' 
                        : 'hover:shadow-md hover:border-gray-300'
                    }`}
                  >
                    <CardContent className="p-5">
                      {isEditing ? (
                        /* Edit Form */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Pencil className="h-4 w-4 text-blue-600" />
                              Editing {user.username}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Email</Label>
                              <Input
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                className="bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Full Name</Label>
                              <Input
                                value={editFormData.full_name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                className="bg-white"
                              />
                            </div>

                            {user.role === 'agent' && (
                              <div className="space-y-2">
                                <Label className="text-sm">Department</Label>
                                <Select
                                  value={editFormData.department || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                  className="bg-white"
                                >
                                  <option value="">Select</option>
                                  <option value="payment">Payment</option>
                                  <option value="loan">Loan</option>
                                  <option value="account">Account</option>
                                  <option value="technical">Technical</option>
                                  <option value="general">General</option>
                                </Select>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label className="text-sm">Status</Label>
                              <Select
                                value={editFormData.is_active ? 'true' : 'false'}
                                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })}
                                className="bg-white"
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </Select>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleUpdateUser(user.id)}
                              disabled={updating}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {updating ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode */
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                            {getInitials(user.full_name)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 truncate">{user.full_name}</h3>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                              </div>
                              {canEditUser(user) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(user)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                                <RoleIcon className="h-3 w-3" />
                                {user.role.replace('_', ' ')}
                              </Badge>
                              {user.is_active ? (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </Badge>
                              )}
                              {user.department && (
                                <Badge variant="outline" className="capitalize">
                                  {user.department}
                                </Badge>
                              )}
                            </div>

                            {/* Details */}
                            <div className="mt-3 space-y-1 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                                {user.last_login_at && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Last seen {new Date(user.last_login_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
