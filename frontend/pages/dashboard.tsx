import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { tables, customers, orders } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTables: 0,
    occupiedTables: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [tablesRes, customersRes, ordersRes] = await Promise.all([
        tables.getAll(),
        customers.getAll(),
        orders.getAll(),
      ]);

      const allTables = tablesRes.data;
      const allCustomers = customersRes.data;
      const allOrders = ordersRes.data;

      const occupied = allTables.filter((t: any) => t.status === 'occupied').length;
      const pending = allOrders.filter((o: any) => o.status === 'pending').length;
      const revenue = allOrders.reduce((sum: number, o: any) => sum + o.total, 0);

      setStats({
        totalTables: allTables.length,
        occupiedTables: occupied,
        totalCustomers: allCustomers.length,
        pendingOrders: pending,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTables}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.occupiedTables} occupied
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">रू {stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/tables"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">🪑 Manage Tables</span>
            </a>
            <a
              href="/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">📋 View Orders</span>
            </a>
            <a
              href="/customers"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">👥 Manage Customers</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
