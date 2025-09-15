import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [activeTab, setActiveTab] = useState('po');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file, uploadType) => {
    if (!file) return;

    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      setMessage('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      setMessageType('error');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage('File size must be less than 50MB');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = uploadType === 'po' ? '/api/upload' : '/api/upload-acceptance';
      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`${uploadType === 'po' ? 'PO' : 'Acceptance'} file uploaded successfully!`);
      setMessageType('success');

      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(
        error.response?.data?.detail ||
        `Failed to upload ${uploadType === 'po' ? 'PO' : 'Acceptance'} file. Please try again.`
      );
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0], activeTab);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleFileUpload(files[0], activeTab);
    e.target.value = '';
  };

  return (
    <div className="upload-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">File Upload</h1>
        <p className="dashboard-subtitle">Upload your PO and Acceptance files</p>
      </div>

      {message && <div className={`alert alert-${messageType}`}>{message}</div>}

      <div className="upload-tabs">
        <button
          className={`upload-tab ${activeTab === 'po' ? 'active' : ''}`}
          onClick={() => setActiveTab('po')}
        >
          Purchase Orders
        </button>
        <button
          className={`upload-tab ${activeTab === 'acceptance' ? 'active' : ''}`}
          onClick={() => setActiveTab('acceptance')}
        >
          Acceptances
        </button>
      </div>

      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="upload-icon">📁</div>
        <div className="upload-text">{uploading ? 'Uploading...' : 'Drop your file here or click to browse'}</div>
        <input
          id="file-input"
          type="file"
          className="file-input"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default FileUpload;
