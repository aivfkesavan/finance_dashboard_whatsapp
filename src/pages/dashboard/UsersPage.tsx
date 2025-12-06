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
} from 'lucide-react';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

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

  const canCreateUser = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const canEditUser = (user: User) => {
    // Super admin can edit anyone except themselves
    if (currentUser?.role === 'super_admin') {
      return user.role !== 'super_admin' || user.id !== currentUser.id;
    }
    // Admin can only edit agents
    if (currentUser?.role === 'admin') {
      return user.role === 'agent';
    }
    return false;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Agents</h1>
            <p className="text-gray-600 mt-1">
              {users?.length || 0} {users?.length === 1 ? 'user' : 'users'} in the system
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadUsers} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canCreateUser && (
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        </div>

        {/* Create User Form */}
        {showCreateForm && canCreateUser && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New User
              </CardTitle>
              <CardDescription>
                Add a new admin or agent to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="john_doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'agent' })}
                      required
                    >
                      {currentUser?.role === 'super_admin' && (
                        <option value="admin">Admin</option>
                      )}
                      <option value="agent">Agent</option>
                    </Select>
                  </div>

                  {/* Department (for agents only) */}
                  {formData.role === 'agent' && (
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
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
                    <div>
                      <Label htmlFor="agent_capacity">Agent Capacity</Label>
                      <Input
                        id="agent_capacity"
                        type="number"
                        value={formData.agent_capacity || ''}
                        onChange={(e) => setFormData({ ...formData, agent_capacity: parseInt(e.target.value) || undefined })}
                        placeholder="15"
                        min={1}
                        max={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">Max tickets agent can handle (default: 15)</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role_filter">Role</Label>
                <Select
                  id="role_filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="department_filter">Department</Label>
                <Select
                  id="department_filter"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
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
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              All users with access to the admin dashboard
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
                <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const isEditing = editingUserId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isEditing 
                          ? 'border-blue-400 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      {isEditing ? (
                        /* Edit Form */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Pencil className="h-4 w-4 text-blue-600" />
                              Editing: {user.username}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`edit-email-${user.id}`}>Email</Label>
                              <Input
                                id={`edit-email-${user.id}`}
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`edit-full_name-${user.id}`}>Full Name</Label>
                              <Input
                                id={`edit-full_name-${user.id}`}
                                value={editFormData.full_name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                              />
                            </div>

                            {user.role === 'agent' && (
                              <div>
                                <Label htmlFor={`edit-department-${user.id}`}>Department</Label>
                                <Select
                                  id={`edit-department-${user.id}`}
                                  value={editFormData.department || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
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

                            <div>
                              <Label htmlFor={`edit-is_active-${user.id}`}>Status</Label>
                              <Select
                                id={`edit-is_active-${user.id}`}
                                value={editFormData.is_active ? 'true' : 'false'}
                                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })}
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
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {updating ? 'Saving...' : 'Save Changes'}
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
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              <RoleIcon className="h-6 w-6" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                                <Badge variant={getRoleBadgeVariant(user.role)}>
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
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Username:</span> {user.username}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {user.email}
                                </div>
                                {user.department && (
                                  <div>
                                    <span className="font-medium">Department:</span> {user.department}
                                  </div>
                                )}
                                {user.last_login_at && (
                                  <div>
                                    <span className="font-medium">Last Login:</span>{' '}
                                    {new Date(user.last_login_at).toLocaleDateString()}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Created:</span>{' '}
                                  {new Date(user.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Edit Button */}
                          {canEditUser(user) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(user)}
                              className="ml-4"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
