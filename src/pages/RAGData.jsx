import { useState } from 'react';
import { ragAPI } from '../services/api';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import './RAGData.css';

export const RAGData = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const allowedExtensions = ['.xlsx', '.xls', '.csv', '.pdf', '.docx', '.txt', '.md'];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const data = await ragAPI.updateRAGData(files);
      setResult(data);
      setFiles([]);
      // Reset file input
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update RAG data');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="rag-data-page">
      <div className="page-header">
        <div>
          <h1>RAG Data Management</h1>
          <p className="text-secondary">Update knowledge base documents</p>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="alert alert-warning">
        <AlertCircle size={20} />
        <div>
          <strong>Warning:</strong> Uploading new files will delete all existing RAG data and
          replace it with the new files. This action cannot be undone.
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div className="card-header">Upload Documents</div>

        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              id="fileInput"
              type="file"
              multiple
              accept={allowedExtensions.join(',')}
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="fileInput" className="file-input-label">
              <Upload size={24} />
              <span>Choose Files</span>
            </label>
          </div>

          <div className="file-info">
            <p className="text-secondary">
              Supported formats: {allowedExtensions.join(', ')}
            </p>
          </div>

          {files.length > 0 && (
            <div className="selected-files">
              <h3>Selected Files ({files.length})</h3>
              <div className="files-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <File size={16} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary btn-upload"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading and Indexing...' : 'Upload & Update RAG Data'}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mt-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="result-section">
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>{result.message}</span>
            </div>

            <div className="result-details">
              <h3>Update Summary</h3>

              <div className="result-stats">
                <div className="result-stat">
                  <span className="stat-label">Deleted Old Files</span>
                  <span className="stat-value">{result.summary.deleted_old_files}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Uploaded New Files</span>
                  <span className="stat-value">{result.summary.uploaded_new_files}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Documents Indexed</span>
                  <span className="stat-value">{result.summary.documents_indexed}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Vector Points</span>
                  <span className="stat-value">
                    {result.summary.collection_info.total_points}
                  </span>
                </div>
              </div>

              {result.uploaded_files && result.uploaded_files.length > 0 && (
                <div className="uploaded-files-list">
                  <h4>Uploaded Files:</h4>
                  <ul>
                    {result.uploaded_files.map((file, index) => (
                      <li key={index}>
                        {file.filename} ({formatFileSize(file.size)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.deleted_files && result.deleted_files.length > 0 && (
                <div className="deleted-files-list">
                  <h4>Deleted Files:</h4>
                  <ul>
                    {result.deleted_files.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
