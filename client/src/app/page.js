'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function Home() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanStatus, setLoanStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loanForm, setLoanForm] = useState({
    loan_amount: 0,
    repayment_period: 0
  });

  const [repaymentForm, setRepaymentForm] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get(`{API_BASE}/loans`);
      setLoans(response.data);
    } catch (err) {
      setError('Failed to fetch loans');
    }
  };

  const createLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`{API_BASE}/create-loans`, loanForm);
      setLoanForm({ loan_amount: 0, repayment_period: 0 });
      fetchLoans();
    } catch (err) {
      setError('Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  const addRepayment = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setLoading(true);
    setError('');

    try {
      const repaymentData = {
        amount: repaymentForm.amount,
        date: new Date(repaymentForm.date + 'T00:00:00').toISOString()
      };

      await axios.post(`{API_BASE}/loans/{selectedLoan}/repayments`, repaymentData);
      setRepaymentForm({ amount: 0, date: new Date().toISOString().split('T')[0] });
      fetchLoanStatus(selectedLoan);
    } catch (err) {
      setError('Failed to add repayment');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanStatus = async (loanId) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`{API_BASE}/loans/{loanId}/status`);
      setLoanStatus(response.data);
      setSelectedLoan(loanId);
    } catch (err) {
      setError('Failed to fetch loan status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track':
        return 'text-green-600 bg-green-100';
      case 'Ahead':
        return 'text-blue-600 bg-blue-100';
      case 'Behind':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Loan Tracking System</h1>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Loan Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Loan</h2>
            <form onSubmit={createLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount ()
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={loanForm.loan_amount || ''}
                  onChange={(e) => setLoanForm({...loanForm, loan_amount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Period (months)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={loanForm.repayment_period || ''}
                  onChange={(e) => setLoanForm({...loanForm, repayment_period: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Loan'}
              </button>
            </form>
          </div>

          {/* Add Repayment Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Repayment</h2>
            <form onSubmit={addRepayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Loan
                </label>
                <select
                  required
                  value={selectedLoan || ''}
                  onChange={(e) => setSelectedLoan(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a loan</option>
                  {loans.map(loan => (
                    <option key={loan.id} value={loan.id}>
                      Loan #{loan.id} - {loan.loan_amount}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount ()
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={repaymentForm.amount || ''}
                  onChange={(e) => setRepaymentForm({...repaymentForm, amount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={repaymentForm.date}
                  onChange={(e) => setRepaymentForm({...repaymentForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !selectedLoan}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Repayment'}
              </button>
            </form>
          </div>

          {/* Loan Status Dashboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Loan Status</h2>
            <div className="space-y-2 mb-4">
              {loans.map(loan => (
                <button
                  key={loan.id}
                  onClick={() => fetchLoanStatus(loan.id)}
                  className="w-full text-left p-2 rounded border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="font-medium">Loan #{loan.id}</div>
                  <div className="text-sm text-gray-600">{loan.loan_amount} - {loan.repayment_period} months</div>
                </button>
              ))}
            </div>

            {loanStatus && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Loan #{loanStatus.loan_id} Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Monthly Payment:</span>
                    <span className="font-medium">{loanStatus.expected_monthly_installment.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-medium">{loanStatus.total_amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Paid:</span>
                    <span className="font-medium">{loanStatus.expected_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Balance:</span>
                    <span className="font-medium">{loanStatus.remaining_balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Months Elapsed:</span>
                    <span className="font-medium">{loanStatus.months_elapsed}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium {getStatusColor(loanStatus.status)}`}>
                      {loanStatus.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
