import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useEffect, useState } from 'react';
import { tables, customers, orders, payments } from '@/lib/api';
import {
  LayoutGrid,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTables: 0,
    occupiedTables: 0,
    freeTables: 0,
    reservedTables: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    servedOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    outstandingCredit: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [tablesRes, customersRes, ordersRes] = await Promise.all([
        tables.getAll(),
        customers.getAll(),
        orders.getAll(),
      ]);

      const allTables = tablesRes.data || [];
      const allCustomers = customersRes.data || [];
      const allOrders = ordersRes.data || [];

      const occupied = allTables.filter((t: any) => t.status === 'occupied').length;
      const free = allTables.filter((t: any) => t.status === 'free').length;
      const reserved = allTables.filter((t: any) => t.status === 'reserved').length;
      const pending = allOrders.filter((o: any) => o.status === 'pending').length;
      const served = allOrders.filter((o: any) => o.status === 'served').length;
      const totalRevenue = allOrders.filter((o: any) => o.status === 'billed').reduce((sum: number, o: any) => sum + o.total, 0);
      const outstandingCredit = allCustomers.reduce((sum: number, c: any) => sum + (c.credit_balance || 0), 0);

      // Get today's revenue
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = allOrders
        .filter((o: any) => o.status === 'billed' && o.created_at?.startsWith(today))
        .reduce((sum: number, o: any) => sum + o.total, 0);

      setStats({
        totalTables: allTables.length,
        occupiedTables: occupied,
        freeTables: free,
        reservedTables: reserved,
        totalCustomers: allCustomers.length,
        pendingOrders: pending,
        servedOrders: served,
        todayRevenue,
        totalRevenue,
        outstandingCredit,
      });

      // Get recent orders
      setRecentOrders(allOrders.slice(0, 5));
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Altia Cafe Management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Tables" value={stats.totalTables} icon={LayoutGrid} color="blue" />
          <StatCard title="Occupied" value={stats.occupiedTables} icon={Users} color="red" />
          <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} color="yellow" />
          <StatCard title="Today's Revenue" value={`रू ${stats.todayRevenue.toFixed(2)}`} icon={TrendingUp} color="green" />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Table Status</span>
              <LayoutGrid size={20} className="text-gray-400" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">Free:</span>
                <span className="font-semibold">{stats.freeTables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Reserved:</span>
                <span className="font-semibold">{stats.reservedTables}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Orders</span>
              <ShoppingCart size={20} className="text-gray-400" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-600">Pending:</span>
                <span className="font-semibold">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Served:</span>
                <span className="font-semibold">{stats.servedOrders}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Financials</span>
              <DollarSign size={20} className="text-gray-400" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">Total Revenue:</span>
                <span className="font-semibold">रू {stats.totalRevenue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Outstanding:</span>
                <span className="font-semibold">रू {stats.outstandingCredit.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={24} className="text-blue-600" />
            Quick Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-900">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-900">{stats.freeTables}</p>
              <p className="text-sm text-gray-600">Available Tables</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-900">{stats.pendingOrders + stats.servedOrders}</p>
              <p className="text-sm text-gray-600">Active Orders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">रू {stats.todayRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Today's Sales</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(stats.outstandingCredit > 0 || stats.pendingOrders > 5) && (
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">Attention Required</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  {stats.outstandingCredit > 0 && (
                    <li>• Outstanding credit balance: रू {stats.outstandingCredit.toFixed(2)}</li>
                  )}
                  {stats.pendingOrders > 5 && (
                    <li>• High number of pending orders ({stats.pendingOrders})</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
<p className="text-3xl font-bold text-gray-900">रू {stats.totalRevenue.toFixed(2)}</p>
              </div >
  <div className="bg-purple-100 rounded-full p-3">
    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
            </div >
          </div >
        </div >

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
      </div >
    </Layout >
  );
}
