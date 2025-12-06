import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import type { TestingConfig } from '../../types';
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Calendar,
  CircleDot,
  FlaskConical,
  Phone,
  ToggleLeft,
  ToggleRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Testing Mode state (super_admin only)
  const [testingConfig, setTestingConfig] = useState<TestingConfig | null>(null);
  const [testingPhoneNumber, setTestingPhoneNumber] = useState('');
  const [testingLoading, setTestingLoading] = useState(false);
  const [testingError, setTestingError] = useState<string | null>(null);
  const [testingSuccess, setTestingSuccess] = useState<string | null>(null);

  // Fetch testing config on mount (only for super_admin)
  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadTestingConfig();
    }
  }, [user?.role]);

  const loadTestingConfig = async () => {
    try {
      setTestingLoading(true);
      const config = await api.getTestingConfig();
      setTestingConfig(config);
      setTestingPhoneNumber(config.phone_number || '');
    } catch (err: any) {
      console.error('Failed to load testing config:', err);
      // Don't show error if API doesn't exist yet
    } finally {
      setTestingLoading(false);
    }
  };

  const handleToggleTestingMode = async () => {
    try {
      setTestingError(null);
      setTestingSuccess(null);
      setTestingLoading(true);

      if (testingConfig?.enabled) {
        // Disable testing mode
        const result = await api.disableTestingMode();
        setTestingConfig(result);
        setTestingSuccess('Testing mode disabled successfully');
      } else {
        // Enable testing mode
        if (!testingPhoneNumber.trim()) {
          setTestingError('Please enter a phone number to enable testing mode');
          return;
        }
        const result = await api.enableTestingMode(testingPhoneNumber.trim());
        setTestingConfig(result);
        setTestingSuccess('Testing mode enabled successfully');
      }
    } catch (err: any) {
      setTestingError(err.response?.data?.detail || 'Failed to update testing mode');
    } finally {
      setTestingLoading(false);
    }
  };

  const handleUpdatePhoneNumber = async () => {
    if (!testingPhoneNumber.trim()) {
      setTestingError('Phone number cannot be empty');
      return;
    }

    try {
      setTestingError(null);
      setTestingSuccess(null);
      setTestingLoading(true);

      const result = await api.updateTestingConfig({ phone_number: testingPhoneNumber.trim() });
      setTestingConfig(result);
      setTestingSuccess('Phone number updated successfully');
    } catch (err: any) {
      setTestingError(err.response?.data?.detail || 'Failed to update phone number');
    } finally {
      setTestingLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setChanging(true);
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to change password';
      setError(errorMessage);
    } finally {
      setChanging(false);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and security settings</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and role information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{user?.username}</p>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{user?.full_name}</p>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-4 w-4" />
                  Role
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Badge variant={getRoleBadgeVariant(user?.role || '')}>
                    {user?.role?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Department (if agent) */}
              {user?.department && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    Department
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900 capitalize">{user.department}</p>
                  </div>
                </div>
              )}

              {/* Account Created */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{formatDate(user?.created_at)}</p>
                </div>
              </div>

              {/* Last Login */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Last Login
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{formatDate(user?.last_login_at)}</p>
                </div>
              </div>

              {/* Availability Status (for agents) */}
              {user?.role === 'agent' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-600">
                    <CircleDot className="h-4 w-4" />
                    Availability
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${user?.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="font-medium text-gray-900">
                        {user?.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showChangePassword ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Last changed: Unknown</p>
                  </div>
                </div>
                <Button onClick={() => setShowChangePassword(true)}>
                  Change Password
                </Button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={changing}>
                    {changing ? 'Changing...' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${user?.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
              {user?.is_active && (
                <Badge variant="success">Account in good standing</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Testing Mode Configuration (Super Admin Only) */}
        {user?.role === 'super_admin' && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-amber-600" />
                Testing Mode Configuration
              </CardTitle>
              <CardDescription>
                Configure testing mode to use a specific merchant phone number for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success/Error Messages */}
              {testingSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">{testingSuccess}</p>
                </div>
              )}
              {testingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">{testingError}</p>
                </div>
              )}

              {/* Current Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    testingConfig?.enabled ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    {testingConfig?.enabled ? (
                      <ToggleRight className="h-5 w-5 text-amber-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Testing Mode</p>
                    <p className="text-sm text-gray-500">
                      {testingConfig?.enabled 
                        ? `Active - Using phone: ${testingConfig.phone_number}` 
                        : 'Disabled - Each user sees their own data'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadTestingConfig}
                    disabled={testingLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${testingLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Badge variant={testingConfig?.enabled ? 'warning' : 'secondary'}>
                    {testingConfig?.enabled ? 'ENABLED' : 'DISABLED'}
                  </Badge>
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-3">
                <Label htmlFor="testing_phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Test Merchant Phone Number
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="testing_phone"
                    type="text"
                    value={testingPhoneNumber}
                    onChange={(e) => setTestingPhoneNumber(e.target.value)}
                    placeholder="e.g., 8637609763"
                    className="flex-1"
                  />
                  {testingConfig?.enabled && testingPhoneNumber !== testingConfig.phone_number && (
                    <Button
                      onClick={handleUpdatePhoneNumber}
                      disabled={testingLoading}
                      variant="outline"
                    >
                      {testingLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Update'
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  When testing mode is enabled, all WhatsApp users will see data from this merchant phone number
                </p>
              </div>

              {/* Toggle Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleToggleTestingMode}
                  disabled={testingLoading || (!testingConfig?.enabled && !testingPhoneNumber.trim())}
                  className={testingConfig?.enabled 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-amber-600 hover:bg-amber-700'}
                >
                  {testingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : testingConfig?.enabled ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Disable Testing Mode
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Enable Testing Mode
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How Testing Mode Works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>When Enabled:</strong> All WhatsApp users will get data from the specified test merchant phone</li>
                  <li>• <strong>When Disabled:</strong> Each user's actual phone number is used to fetch their data</li>
                  <li>• Changes apply immediately without server restart</li>
                  <li>• Configuration persists across server restarts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
