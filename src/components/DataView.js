import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    project_name: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params = {
          page: pagination.page,
          per_page: pagination.per_page,
          ...filters
        };

        Object.keys(params).forEach(key => {
          if (params[key] === '') delete params[key];
        });

        const response = await axios.get('/api/merged-data', { params });

        setData(response.data.items);
        setPagination(prev => ({
          ...prev,
          total_count: response.data.total_count,
          total_pages: response.data.total_pages,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev
        }));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.page, pagination.per_page, filters]); // Added pagination.per_page

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExport = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await axios.get('/api/merged-data/export', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filtered_merged_po_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'cancelled';
    if (status.toLowerCase().includes('closed')) return 'closed';
    if (status.toLowerCase().includes('pending')) return 'pending';
    if (status.toLowerCase().includes('cancelled')) return 'cancelled';
    return 'pending';
  };

  if (loading && data.length === 0) {
    return <div className="loading-spinner">Loading data...</div>;
  }

  return (
    <div className="data-view">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Merged Data View</h1>
        <p className="dashboard-subtitle">Combined purchase orders and acceptance data</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters and Controls */}
      <div className="data-controls">
        <div className="filters-row">
          {/* Status Filter */}
          <div className="filter-group">
            <label>Status</label>
            <select
              className="filter-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="CLOSED">Closed</option>
              <option value="Pending AC80%">Pending AC80%</option>
              <option value="Pending PAC20%">Pending PAC20%</option>
              <option value="Pending ACPAC">Pending ACPAC</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label>Category</label>
            <select
              className="filter-input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Survey">Survey</option>
              <option value="Transportation">Transportation</option>
              <option value="Site Engineer">Site Engineer</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {/* Project Name Filter */}
          <div className="filter-group">
            <label>Project Name</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Filter by project..."
              value={filters.project_name}
              onChange={(e) => handleFilterChange('project_name', e.target.value)}
            />
          </div>

          {/* Search Filter */}
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search PO number or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="actions-row">
          <div className="btn-group">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              Export to Excel
            </button>
          </div>
          <div className="pagination-info">
            Showing {data.length} of {pagination.total_count.toLocaleString()} records
          </div>
        </div>
      </div>

      {/* Data Table */}
      {data.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Account</th>
                <th>Project</th>
                <th>Site Code</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Terms</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Line Amount</th>
                <th>AC Amount</th>
                <th>AC Date</th>
                <th>PAC Amount</th>
                <th>PAC Date</th>
                <th>Status</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.po_id}</td>
                  <td>{item.account_name || '-'}</td>
                  <td>{item.project_name || '-'}</td>
                  <td>{item.site_code || '-'}</td>
                  <td>{item.category}</td>
                  <td title={item.item_desc}>
                    {item.item_desc?.length > 50
                      ? item.item_desc.substring(0, 50) + '...'
                      : item.item_desc || '-'}
                  </td>
                  <td>{item.payment_terms || '-'}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td>{item.req_qty || 0}</td>
                  <td>{formatCurrency(item.line_amount)}</td>
                  <td>{formatCurrency(item.ac_amount)}</td>
                  <td>{formatDate(item.ac_date)}</td>
                  <td>{formatCurrency(item.pac_amount)}</td>
                  <td>{formatDate(item.pac_date)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                      {item.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{formatCurrency(item.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3>No Data Available</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Upload your PO and Acceptance files to see merged data here.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {data.length > 0 && pagination.total_pages > 1 && (
        <div className="pagination-controls" style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            style={{ marginRight: '8px' }}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            style={{ marginLeft: '8px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataView;