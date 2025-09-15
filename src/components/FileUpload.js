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

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setMessage('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      setMessageType('error');
      return;
    }

    // Validate file size (50MB limit)
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
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`${uploadType === 'po' ? 'PO' : 'Acceptance'} file uploaded successfully! Processing has started in the background.`);
      setMessageType('success');
      
      // Clear message after 5 seconds
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
    if (files.length > 0) {
      handleFileUpload(files[0], activeTab);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0], activeTab);
    }
    // Reset input value so same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div className="upload-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">File Upload</h1>
        <p className="dashboard-subtitle">Upload your PO and Acceptance files</p>
      </div>

      <div className="upload-card">
        <div className="upload-header">
          <h2 className="upload-title">Upload Data Files</h2>
          <p className="upload-description">
            Select the file type and upload your CSV or Excel files
          </p>
        </div>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        {/* Tab Selection */}
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

        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            {uploading ? 'Uploading...' : 'Drop your file here or click to browse'}
          </div>
          <div className="upload-hint">
            Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 50MB
          </div>
          
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

      {/* File Format Information */}
      <div className="upload-card">
        <h3 className="upload-title">File Format Requirements</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px' }}>
              📊 Purchase Orders File
            </h4>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Your PO file should include these key columns:
            </p>
            <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
              <li>PO No. (required)</li>
              <li>PO Line No. (required)</li>
              <li>Project Name</li>
              <li>Item Description</li>
              <li>Unit Price</li>
              <li>Requested Qty</li>
              <li>Line Amount</li>
              <li>Payment Terms</li>
              <li>Publish Date</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px' }}>
              ✅ Acceptances File
            </h4>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Your Acceptance file should include these key columns:
            </p>
            <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
              <li>Acceptance No. (required)</li>
              <li>PO No. (required)</li>
              <li>PO Line No. (required)</li>
              <li>Shipment No. (required)</li>
              <li>Status</li>
              <li>Milestone Type</li>
              <li>Application Processed</li>
              <li>Project Name</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
          <h4 style={{ color: '#667eea', marginBottom: '8px' }}>💡 Tips for Best Results</h4>
          <ul style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
            <li>Ensure column headers match the expected format</li>
            <li>Remove any empty rows at the top of your file</li>
            <li>Make sure dates are in a consistent format (YYYY-MM-DD preferred)</li>
            <li>Upload PO file first, then the Acceptance file for proper matching</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;