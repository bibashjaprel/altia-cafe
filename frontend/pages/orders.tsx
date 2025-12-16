import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { orders, tables, customers, menu, payments } from '@/lib/api';
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  Filter,
  Search,
  User,
  MapPin,
  ChefHat,
  X,
  Eye,
  Plus,
  Trash2,
  ShoppingCart,
  Utensils,
  CreditCard,
  Wallet,
  Check,
} from 'lucide-react';

interface Order {
  id: number;
  table_id: number;
  customer_id: number;
  status: string;
  total: number;
  notes: string;
  table?: { id: number; name: string };
  customer?: { id: number; name: string };
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
}

export default function Orders() {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [tableList, setTableList] = useState<{ id: number; name: string }[]>([]);
  const [customerList, setCustomerList] = useState<{ id: number; name: string }[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newOrder, setNewOrder] = useState({
    table_id: 0,
    customer_id: 0,
    items: [] as { item_name: string; quantity: number; price: number }[],
  });

  useEffect(() => {
    loadOrders();
    loadTables();
    loadCustomers();
    loadMenuItems();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orderList, statusFilter, searchQuery]);

  const filterOrders = () => {
    let filtered = [...orderList];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.table?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toString().includes(searchQuery)
      );
    }

    setFilteredOrders(filtered);
  };

  const loadOrders = async () => {
    try {
      const res = await orders.getAll();
      setOrderList(res.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadTables = async () => {
    try {
      const res = await tables.getAll();
      setTableList(res.data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await customers.getAll();
      setCustomerList(res.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const res = await menu.getAll({ available: 'true' });
      setMenuItems(res.data || []);

      const categories = [...new Set(res.data.map((item: MenuItem) => item.category))] as string[];
      setMenuCategories(categories);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const handleAddOrder = async () => {
    try {
      await orders.create(newOrder);
      loadOrders();
      setShowAddModal(false);
      setNewOrder({ table_id: 0, customer_id: 0, items: [] });
    } catch (error) {
      console.error('Failed to add order:', error);
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string, newStatus: string) => {
    // Prevent accidental status changes
    if (currentStatus === 'billed') {
      if (!confirm('This order is already billed. Are you sure you want to change its status?')) {
        return;
      }
    }

    try {
      await orders.update(id, { status: newStatus });
      loadOrders();
    } catch (error: any) {
      console.error('Failed to update order:', error);
      alert(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    // Block deletion of billed orders
    if (order.status === 'billed') {
      alert('Cannot delete billed orders. Please contact administrator.');
      return;
    }

    if (!confirm(`Are you sure you want to delete Order #${order.id}?`)) return;

    try {
      await orders.delete(order.id);
      loadOrders();
      alert('Order deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      alert(error.response?.data?.error || 'Failed to delete order');
    }
  };

  const handleBillAndPay = (order: Order) => {
    setSelectedOrder(order);
    setPaymentAmount(order.total);
    setShowBillModal(true);
  };

  const completeBillAndPayment = async () => {
    if (!selectedOrder) return;

    try {
      await orders.update(selectedOrder.id, { status: 'billed' });

      if (paymentAmount > 0) {
        await payments.create({
          customer_id: selectedOrder.customer_id,
          order_id: selectedOrder.id,
          amount: paymentAmount,
          method: paymentMethod,
          notes: `Payment for Order #${selectedOrder.id}`,
        });
      }

      await tables.assignCustomer(selectedOrder.table_id, null, 'free');

      loadOrders();
      setShowBillModal(false);
      setSelectedOrder(null);
      setPaymentAmount(0);
      alert('Bill completed and payment recorded successfully!');
    } catch (error) {
      console.error('Failed to complete billing:', error);
      alert('Error completing billing. Please try again.');
    }
  };

  const addMenuItem = (item: MenuItem) => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { item_name: item.name, quantity: 1, price: item.price }],
    });
  };

  const removeMenuItem = (index: number) => {
    const items = [...newOrder.items];
    items.splice(index, 1);
    setNewOrder({ ...newOrder, items });
  };

  const updateQuantity = (index: number, quantity: number) => {
    const items = [...newOrder.items];
    items[index].quantity = quantity;
    setNewOrder({ ...newOrder, items });
  };

  const getTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'served':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'billed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'served':
        return <ChefHat size={16} />;
      case 'billed':
        return <CheckCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const totalRevenue = orderList
    .filter((o) => o.status === 'billed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orderList.filter((o) => o.status === 'pending').length;
  const servedOrders = orderList.filter((o) => o.status === 'served').length;
  const billedOrders = orderList.filter((o) => o.status === 'billed').length;

  return (
    <Layout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            New Order
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Clock size={32} className="text-yellow-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Served</p>
                <p className="text-2xl font-bold text-blue-600">{servedOrders}</p>
              </div>
              <ChefHat size={32} className="text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Billed</p>
                <p className="text-2xl font-bold text-green-600">{billedOrders}</p>
              </div>
              <CheckCircle size={32} className="text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">रू {totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign size={32} className="text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Search size={16} />
                  Search
                </div>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by order ID, table, or customer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  Status Filter
                </div>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['all', 'pending', 'served', 'billed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`py-2 px-3 rounded-lg font-semibold capitalize transition-all ${statusFilter === status
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here once created'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {order.table?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {order.customer?.name || 'Guest'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">रू {order.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, order.status, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${order.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                              : order.status === 'served'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-green-50 text-green-800 border-green-300'
                            }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="served">Served</option>
                          <option value="billed">Billed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {order.status === 'served' && (
                          <button
                            onClick={() => handleBillAndPay(order)}
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow font-semibold"
                          >
                            <DollarSign size={14} />
                            Bill & Pay
                          </button>
                        )}
                        {order.status !== 'billed' ? (
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Cannot delete billed orders"
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 px-3 py-1 rounded-lg cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={24} />
                  New Order
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Table Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Table
                    </label>
                    <select
                      value={newOrder.table_id}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, table_id: parseInt(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Select Table</option>
                      {tableList.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <User size={16} />
                      Customer
                    </label>
                    <select
                      value={newOrder.customer_id}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, customer_id: parseInt(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Select Customer</option>
                      {customerList.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Utensils size={16} />
                    Menu Items
                  </label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {menuCategories.map((category) => (
                      <div key={category} className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <ChefHat size={14} />
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {menuItems
                            .filter((item) => item.category === category)
                            .map((item) => (
                              <button
                                key={item.id}
                                onClick={() => addMenuItem(item)}
                                className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 px-3 py-2 rounded-lg text-sm text-left transition-all flex justify-between items-center"
                              >
                                <span className="font-medium">{item.name}</span>
                                <span className="text-blue-600 font-semibold">रू {item.price}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Items */}
                {newOrder.items.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                      <Package size={18} />
                      Order Items
                    </h3>
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between mb-2 bg-white rounded-lg p-2 shadow-sm">
                        <span className="flex-1 font-medium text-gray-900">{item.item_name}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center mx-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="w-24 text-right font-semibold text-gray-900">रू {(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeMenuItem(index)}
                          className="ml-2 text-red-600 hover:text-red-900 hover:bg-red-100 p-1 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <DollarSign size={20} />
                        Total:
                      </span>
                      <span className="font-bold text-2xl text-blue-900">रू {getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={handleAddOrder}
                    disabled={
                      newOrder.table_id === 0 || newOrder.customer_id === 0 || newOrder.items.length === 0
                    }
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Check size={18} />
                    Create Order
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill & Payment Modal */}
        {showBillModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign size={24} />
                  Complete Bill & Payment
                </h2>
                <button
                  onClick={() => {
                    setShowBillModal(false);
                    setSelectedOrder(null);
                    setPaymentAmount(0);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Package size={14} />
                    Order #{selectedOrder.id}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <User size={14} />
                    {selectedOrder.customer?.name}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin size={14} />
                    {selectedOrder.table?.name}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-3 flex items-center gap-2">
                    <DollarSign size={24} />
                    Total: रू {selectedOrder.total.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Wallet size={16} />
                    Payment Amount (रू)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <CreditCard size={12} />
                    Remaining credit: रू {(selectedOrder.total - paymentAmount).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <CreditCard size={16} />
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI/eSewa</option>
                  </select>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 space-y-1">
                    <span className="flex items-center gap-2">
                      <Check size={14} />
                      Order will be marked as billed
                    </span>
                    {paymentAmount > 0 && (
                      <span className="flex items-center gap-2">
                        <Check size={14} />
                        Payment of रू {paymentAmount.toFixed(2)} will be recorded
                      </span>
                    )}
                    {paymentAmount < selectedOrder.total && (
                      <span className="flex items-center gap-2">
                        <Check size={14} />
                        Credit balance: रू {(selectedOrder.total - paymentAmount).toFixed(2)}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <Check size={14} />
                      Table will be freed
                    </span>
                  </p>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={completeBillAndPayment}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <DollarSign size={18} />
                    Complete Bill & Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowBillModal(false);
                      setSelectedOrder(null);
                      setPaymentAmount(0);
                    }}
                    className="flex-1 bg-gray-300 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package size={24} />
                  Order #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={12} />
                      Table
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedOrder.table?.name || `Table ${selectedOrder.table_id}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <User size={12} />
                      Customer
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedOrder.customer?.name || 'Guest'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={12} />
                      Created
                    </p>
                    <p className="text-sm font-semibold">Just now</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <Utensils size={18} />
                    Order Items
                  </h3>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex justify-between items-center hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.item_name}</p>
                            <p className="text-xs text-gray-500">
                              रू {item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              रू {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No items</div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign size={20} />
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-blue-900">
                      रू {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'served');
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ChefHat size={18} />
                      Mark as Served
                    </button>
                  )}
                  {selectedOrder.status === 'served' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'billed');
                          setShowDetailModal(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Check size={18} />
                        Mark as Billed
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleBillAndPay(selectedOrder);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <DollarSign size={18} />
                        Bill & Pay
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
