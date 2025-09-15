import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, chartsRes] = await Promise.all([
        axios.get('/api/dashboard-analytics'),
        axios.get('/api/charts-data')
      ]);

      setAnalytics(analyticsRes.data);
      setChartsData(chartsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  if (loading) {
    return (
      <div className="loading-spinner">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to PO Management</h1>
        <p className="dashboard-subtitle">Upload your PO and Acceptance files to get started</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your purchase orders and acceptances</p>
      </div>

      {/* Key Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">
                {formatNumber(analytics.basic_stats?.total_merged_records || 0)}
              </div>
              <div className="stat-label">Total Records</div>
            </div>
            <div className="stat-icon primary">📊</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">
                {formatCurrency(analytics.basic_stats?.total_value || 0)}
              </div>
              <div className="stat-label">Total Value</div>
            </div>
            <div className="stat-icon success">💰</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">
                {formatNumber(analytics.basic_stats?.total_pos || 0)}
              </div>
              <div className="stat-label">Purchase Orders</div>
            </div>
            <div className="stat-icon warning">📋</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">
                {formatNumber(analytics.basic_stats?.total_acceptances || 0)}
              </div>
              <div className="stat-label">Acceptances</div>
            </div>
            <div className="stat-icon danger">✅</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartsData && (
        <div className="charts-grid">
          {/* Status Distribution Pie Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartsData.status_pie_chart?.labels.map((label, index) => ({
                    name: label,
                    value: chartsData.status_pie_chart.data[index],
                    amount: chartsData.status_pie_chart.values[index]
                  })) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartsData.status_pie_chart?.labels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [
                  `${formatNumber(value)} records`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Project Values Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Top Projects by Value</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartsData.project_bar_chart?.labels.map((label, index) => ({
                  name: label.length > 15 ? label.substring(0, 15) + '...' : label,
                  value: chartsData.project_bar_chart.data[index],
                  pending: chartsData.project_bar_chart.pending_amounts[index]
                })) || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name === 'value' ? 'Total Value' : 'Pending Amount'
                  ]}
                />
                <Legend />
                <Bar dataKey="value" fill="#667eea" name="Total Value" />
                <Bar dataKey="pending" fill="#f093fb" name="Pending Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status Breakdown Table */}
      {analytics.status_breakdown && analytics.status_breakdown.length > 0 && (
        <div className="chart-card" style={{ marginTop: '24px' }}>
          <h3 className="chart-title">Status Breakdown</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Total Value</th>
                  <th>Pending Amount</th>
                </tr>
              </thead>
              <tbody>
                {analytics.status_breakdown.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase().includes('closed') ? 'closed' : item.status.toLowerCase().includes('pending') ? 'pending' : 'cancelled'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatNumber(item.count)}</td>
                    <td>{item.percentage}%</td>
                    <td>{formatCurrency(item.total_value)}</td>
                    <td>{formatCurrency(item.pending_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Terms Distribution */}
      {analytics.payment_terms_distribution && analytics.payment_terms_distribution.length > 0 && (
        <div className="chart-card" style={{ marginTop: '24px' }}>
          <h3 className="chart-title">Payment Terms Distribution</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Terms</th>
                  <th>Count</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics.payment_terms_distribution.map((item, index) => (
                  <tr key={index}>
                    <td>{item.payment_terms || 'Not Specified'}</td>
                    <td>{formatNumber(item.count)}</td>
                    <td>{formatCurrency(item.total_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;