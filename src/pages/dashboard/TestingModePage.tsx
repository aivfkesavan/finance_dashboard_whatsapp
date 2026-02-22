import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import type { TestingModeConfig, WhitelistNumber } from '../../types';
import {
  FlaskConical,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Save,
  Phone,
} from 'lucide-react';

export function TestingModePage() {
  const [config, setConfig] = useState<TestingModeConfig | null>(null);
  const [whitelist, setWhitelist] = useState<WhitelistNumber[]>([]);
  const [whitelistTotal, setWhitelistTotal] = useState(0);
  const [whitelistPage, setWhitelistPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Static response
  const [staticMessage, setStaticMessage] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);

  // Add numbers
  const [phoneInput, setPhoneInput] = useState('');
  const [addingNumbers, setAddingNumbers] = useState(false);

  // File upload
  const [uploading, setUploading] = useState(false);

  // Deleting IDs (prevent double-click)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // Feedback
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearFeedback = () => {
    setSuccess(null);
    setError(null);
  };

  const showSuccess = (msg: string) => {
    clearFeedback();
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    clearFeedback();
    setError(msg);
  };

  const loadConfig = useCallback(async () => {
    try {
      const data = await api.getTestingModeConfig();
      setConfig(data);
      setStaticMessage(data.static_response_message);
    } catch (err: any) {
      showError('Failed to load config');
    }
  }, []);

  const loadWhitelist = useCallback(async (page = 1) => {
    try {
      const data = await api.getWhitelist(page);
      setWhitelist(data.numbers);
      setWhitelistTotal(data.total);
      setWhitelistPage(page);
    } catch (err: any) {
      console.error('Failed to load whitelist:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadConfig(), loadWhitelist()]);
      setLoading(false);
    };
    init();
  }, [loadConfig, loadWhitelist]);

  const handleToggle = async () => {
    try {
      setToggling(true);
      clearFeedback();
      const result = await api.toggleTestingMode();
      setConfig(prev => prev ? { ...prev, is_enabled: result.is_enabled } : prev);
      showSuccess(result.message);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to toggle');
    } finally {
      setToggling(false);
    }
  };

  const handleSaveStaticResponse = async () => {
    if (!staticMessage.trim()) {
      showError('Message cannot be empty');
      return;
    }
    try {
      setSavingMessage(true);
      clearFeedback();
      await api.updateStaticResponse(staticMessage.trim());
      showSuccess('Static response updated');
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to update');
    } finally {
      setSavingMessage(false);
    }
  };

  const handleAddNumbers = async () => {
    const numbers = phoneInput.split(',').map(n => n.trim()).filter(Boolean);
    if (numbers.length === 0) {
      showError('Enter at least one phone number');
      return;
    }
    try {
      setAddingNumbers(true);
      clearFeedback();
      const result = await api.addWhitelistNumbers(numbers);
      showSuccess(`Added ${result.added} number(s)${result.skipped > 0 ? `, ${result.skipped} skipped (duplicate or invalid)` : ''}`);
      setPhoneInput('');
      await Promise.all([loadWhitelist(1), loadConfig()]);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to add numbers');
    } finally {
      setAddingNumbers(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      clearFeedback();
      const result = await api.uploadWhitelistFile(file);
      showSuccess(`Uploaded: ${result.added} added, ${result.skipped} skipped`);
      await Promise.all([loadWhitelist(1), loadConfig()]);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveNumber = async (id: number) => {
    if (deletingIds.has(id)) return;
    try {
      setDeletingIds(prev => new Set(prev).add(id));
      clearFeedback();
      await api.removeWhitelistNumber(id);
      showSuccess('Number removed');
      await Promise.all([loadWhitelist(whitelistPage), loadConfig()]);
    } catch (err: any) {
      showError('Failed to remove number');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to remove ALL whitelisted numbers?')) return;
    try {
      clearFeedback();
      await api.clearWhitelist();
      showSuccess('Whitelist cleared');
      await Promise.all([loadWhitelist(1), loadConfig()]);
    } catch (err: any) {
      showError('Failed to clear whitelist');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testing Mode</h1>
          <p className="text-gray-600 mt-1">
            Control who can access the bot during maintenance or testing periods
          </p>
        </div>

        {/* Feedback */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Section 1: Toggle & Status */}
        <Card className={config?.is_enabled ? 'border-amber-300 bg-amber-50/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-amber-600" />
              Testing Mode Status
            </CardTitle>
            <CardDescription>
              When enabled, non-whitelisted users receive a static response instead of bot access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant={config?.is_enabled ? 'warning' : 'secondary'}
                  className="text-sm px-3 py-1"
                >
                  {config?.is_enabled ? 'ENABLED' : 'DISABLED'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {config?.whitelist_count || 0} whitelisted number(s)
                </span>
              </div>
              <Button
                onClick={handleToggle}
                disabled={toggling}
                variant={config?.is_enabled ? 'destructive' : 'default'}
                className={!config?.is_enabled ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {toggling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : config?.is_enabled ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {config?.is_enabled ? 'Disable' : 'Enable'} Testing Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Static Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Static Response Message
            </CardTitle>
            <CardDescription>
              This message is sent to non-whitelisted users when testing mode is active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={staticMessage}
              onChange={(e) => setStaticMessage(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-y text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the message non-whitelisted users will see..."
            />
            <Button
              onClick={handleSaveStaticResponse}
              disabled={savingMessage || staticMessage === config?.static_response_message}
            >
              {savingMessage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Message
            </Button>
          </CardContent>
        </Card>

        {/* Section 3: Whitelist Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Number Whitelist
            </CardTitle>
            <CardDescription>
              These numbers can access the bot even when testing mode is enabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add numbers manually */}
            <div className="space-y-2">
              <Label>Add Phone Numbers</Label>
              <div className="flex gap-3">
                <Input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Enter comma-separated numbers (e.g., 9876543210, 9123456789)"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNumbers()}
                />
                <Button onClick={handleAddNumbers} disabled={addingNumbers || !phoneInput.trim()}>
                  {addingNumbers ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add
                </Button>
              </div>
            </div>

            {/* File upload */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload CSV/Excel'}
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <a
                href={api.getWhitelistSampleCsvUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Download className="h-4 w-4" />
                Download Sample CSV
              </a>
            </div>

            {/* Whitelist table */}
            {whitelist.length > 0 ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Phone Number</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Label</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {whitelist.map((num) => (
                        <tr key={num.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono">{num.phone_number}</td>
                          <td className="px-4 py-3 text-gray-500">{num.label || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {num.created_at ? new Date(num.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveNumber(num.id)}
                              disabled={deletingIds.has(num.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              {deletingIds.has(num.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {whitelistTotal > 50 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Showing {(whitelistPage - 1) * 50 + 1}-{Math.min(whitelistPage * 50, whitelistTotal)} of {whitelistTotal}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={whitelistPage <= 1}
                        onClick={() => loadWhitelist(whitelistPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={whitelistPage * 50 >= whitelistTotal}
                        onClick={() => loadWhitelist(whitelistPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {/* Clear all */}
                <div className="pt-2 border-t">
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All ({whitelistTotal})
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Phone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No whitelisted numbers yet</p>
                <p className="text-sm">Add numbers above to allow access during testing mode</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
