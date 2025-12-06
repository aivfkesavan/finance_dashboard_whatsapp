import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { api } from '../../lib/api';
import type { KnowledgeBaseEntry, CreateKnowledgeBaseEntry, RAGSyncStatus } from '../../types';
import {
  BookOpen,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Database,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  FileText,
  Tag,
} from 'lucide-react';

export function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<RAGSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [formData, setFormData] = useState<CreateKnowledgeBaseEntry>({
    question_id: 0,
    category: '',
    question: '',
    answer: '',
    keywords: '',
  });
  const [saving, setSaving] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Sync state
  const [syncing, setSyncing] = useState(false);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPage, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [entriesRes, categoriesRes, statusRes] = await Promise.all([
        api.listKnowledgeBaseEntries({
          skip: (currentPage - 1) * pageSize,
          limit: pageSize,
          category: categoryFilter || undefined,
          search: searchQuery || undefined,
        }),
        api.getRAGCategories().catch(() => []),
        api.getRAGSyncStatus().catch(() => null),
      ]);

      setEntries(entriesRes.entries);
      setTotal(entriesRes.total);
      setCategories(categoriesRes);
      setSyncStatus(statusRes);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to access Knowledge Base. Super Admin access required.');
      } else {
        setError('Failed to load knowledge base');
      }
      console.error('Error loading knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const startCreate = async () => {
    try {
      const nextId = await api.getNextQuestionId();
      setFormData({
        question_id: nextId,
        category: categories[0] || '',
        question: '',
        answer: '',
        keywords: '',
      });
      setShowCreateForm(true);
      setEditingEntry(null);
    } catch (err) {
      setError('Failed to get next question ID');
    }
  };

  const startEdit = (entry: KnowledgeBaseEntry) => {
    setEditingEntry(entry);
    setFormData({
      question_id: entry.question_id,
      category: entry.category,
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords,
    });
    setShowCreateForm(false);
    setIsNewCategory(false);
    setNewCategoryName('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setShowCreateForm(false);
    setFormData({
      question_id: 0,
      category: '',
      question: '',
      answer: '',
      keywords: '',
    });
    setIsNewCategory(false);
    setNewCategoryName('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Use new category name if creating a new category
      const categoryToSave = isNewCategory ? newCategoryName : formData.category;

      if (!categoryToSave) {
        setError('Please select or enter a category');
        setSaving(false);
        return;
      }

      if (editingEntry) {
        await api.updateKnowledgeBaseEntry(editingEntry.id, {
          category: categoryToSave,
          question: formData.question,
          answer: formData.answer,
          keywords: formData.keywords,
        });
        setSuccess('Entry updated successfully! Remember to sync to DB.');
      } else {
        await api.createKnowledgeBaseEntry({
          ...formData,
          category: categoryToSave,
        });
        setSuccess('Entry created successfully! Remember to sync to DB.');
      }

      cancelEdit();
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      return;
    }

    try {
      await api.deleteKnowledgeBaseEntry(id);
      setSuccess('Entry deleted successfully! Remember to sync to DB.');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete entry');
    }
  };

  const handleSync = async () => {
    if (!confirm('This will sync ALL entries to the database. Continue?')) {
      return;
    }

    try {
      setSyncing(true);
      setError(null);
      const result = await api.syncToQdrant();
      setSuccess(`Synced ${result.vectors_uploaded} entries to DB in ${result.time_taken_seconds.toFixed(1)}s`);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sync to DB');
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setImporting(true);
      setError(null);
      const result = await api.importCSV(importFile, clearExisting);
      setSuccess(`Imported ${result.imported} entries (${result.skipped} skipped). Remember to sync to DB!`);
      setShowImportModal(false);
      setImportFile(null);
      setClearExisting(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              Knowledge Base
            </h1>
            <p className="text-gray-600 mt-1">
              Manage Q&A entries for the AI chatbot
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowImportModal(true)} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={startCreate} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <FileText className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <Tag className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">DB Vectors</p>
                  <p className="text-2xl font-bold text-gray-900">{syncStatus?.qdrant_vectors || 0}</p>
                </div>
                <Database className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={syncStatus?.in_sync ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-2">Sync Status</p>
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-3 w-3 rounded-full ${syncStatus?.in_sync ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                <span className={`font-medium ${syncStatus?.in_sync ? 'text-green-700' : 'text-orange-700'}`}>
                  {syncStatus?.in_sync ? 'In Sync' : 'Out of Sync'}
                </span>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm uppercase tracking-wide shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2 ${
                  syncing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : syncStatus?.in_sync 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Syncing to DB...
                  </>
                ) : (
                  <>
                    <Database className="h-5 w-5" />
                    Sync to DB
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingEntry) && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingEntry ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingEntry ? 'Edit Entry' : 'Create New Entry'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Question ID</Label>
                    <Input
                      type="number"
                      value={formData.question_id}
                      onChange={(e) => setFormData({ ...formData, question_id: parseInt(e.target.value) })}
                      disabled={!!editingEntry}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={isNewCategory ? '__new__' : formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setIsNewCategory(true);
                          setNewCategoryName('');
                        } else {
                          setIsNewCategory(false);
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__new__">+ New Category</option>
                    </Select>
                    {isNewCategory && (
                      <Input
                        className="mt-2"
                        placeholder="Enter new category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Question</Label>
                  <Input
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="What is the question?"
                  />
                </div>

                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Detailed answer..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Entry'}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search questions, answers, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-48"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>Entries</CardTitle>
            <CardDescription>
              {total} total entries in the knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No entries found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="font-mono">
                            #{entry.question_id}
                          </Badge>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {entry.category}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2">{entry.question}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{entry.answer}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Keywords: {entry.keywords}</span>
                          <span>Updated: {formatDate(entry.updated_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(entry)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import CSV
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to import entries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: question_id, category, question, answer, keywords
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="clearExisting"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="clearExisting" className="text-sm text-red-600">
                    Delete all existing entries before import
                  </Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleImport} disabled={!importFile || importing}>
                    {importing ? 'Importing...' : 'Import'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setClearExisting(false);
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

