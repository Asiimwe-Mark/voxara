/**
 * Admin - Billing Management Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface BillingRecord {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_charge_id: string;
  created_at: string;
}

export default function AdminBilling() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

  useEffect(() => {
    const fetchBillingRecords = async () => {
      try {
        const response = await fetch(
          `/api/admin/billing?status=${filter === 'all' ? '' : filter}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch billing records');
        }
        const data = await response.json();
        setRecords(data.records);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingRecords();
  }, [filter]);

  if (loading) return <div className="text-center py-12">Loading billing records...</div>;

  const stats = {
    totalCompleted: records.filter((r) => r.status === 'completed').length,
    totalFailed: records.filter((r) => r.status === 'failed').length,
    totalRevenue: records
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
        <p className="mt-2 text-gray-600">Monitor and manage payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6 bg-green-50">
          <p className="text-sm text-gray-600">Successful Payments</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {stats.totalCompleted}
          </p>
        </Card>
        <Card className="p-6 bg-red-50">
          <p className="text-sm text-gray-600">Failed Payments</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {stats.totalFailed}
          </p>
        </Card>
        <Card className="p-6 bg-blue-50">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            ${(stats.totalRevenue / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">Error: {error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'completed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setLoading(true);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Billing Records Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                    No billing records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {record.email}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${(record.amount / 100).toFixed(2)} {record.currency}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {record.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">Completed</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-700">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
