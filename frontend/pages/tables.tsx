import Layout from '@/components/Layout';
import CreditPaymentForm from '@/components/CreditPaymentForm';
import { useEffect, useState } from 'react';
import { tables, customers, menu, orders } from '@/lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  ChefHat,
  Users,
  Zap,
  Printer,
  Utensils,
  Coins,
  LayoutGrid,
  Clock,
  Check,
  MapPin,
  User,
  Phone,
  Wallet,
} from 'lucide-react';

interface Table {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  status: 'free' | 'occupied' | 'reserved';
  customer_id?: number;
  customer?: any;
  guest_name?: string;
  guest_phone?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  credit_balance: number;
}

export default function Tables() {
  const [tableList, setTableList] = useState<Table[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [assignType, setAssignType] = useState<'registered' | 'guest'>('registered');
  const [guestName, setGuestName] = useState('');
  const [reserveCustomerId, setReserveCustomerId] = useState(0);
  const [reserveTime, setReserveTime] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [tableOrders, setTableOrders] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState('cash');
  const [newTable, setNewTable] = useState({
    name: '',
    position_x: 0,
    position_y: 0,
    width: 100,
    height: 100,
  });

  // Order creation state
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [newOrderItems, setNewOrderItems] = useState<Array<{ item_id: number; item_name: string; price: number; quantity: number }>>([]);

  useEffect(() => {
    loadTables();
    loadCustomers();
  }, []);

  const loadMenuItems = async () => {
    try {
      const res = await menu.getAll({ available: 'true' });
      setMenuItems(res.data || []);
      const categories = [...new Set((res.data || []).map((item: any) => item.category))] as string[];
      setMenuCategories(categories);
    } catch (error) {
      console.error('Failed to load menu:', error);
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

  const handleAssignCustomer = async (customerId: number | null, status: string) => {
    if (!selectedTable) return;

    try {
      if (assignType === 'guest') {
        await tables.assignCustomer(selectedTable.id, null, 'occupied', guestName, guestPhone);
      } else {
        await tables.assignCustomer(selectedTable.id, customerId, status);
      }
      loadTables();
      setShowAssignModal(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Failed to assign customer:', error);
    }
  };

  const handleShowPayout = async (table: Table) => {
    setSelectedTable(table);
    try {
      const res = await tables.getOrders(table.id);
      setTableOrders(res.data);
      setPayoutAmount(res.data.total);
      setShowPayoutModal(true);
    } catch (error) {
      console.error('Failed to load table orders:', error);
    }
  };

  const handlePayout = async () => {
    if (!selectedTable) return;

    // For credit option, set payment amount to 0 (all goes to credit)
    const actualPayment = payoutMethod === 'credit' ? 0 : payoutAmount;

    if (payoutMethod === 'credit') {
      if (!confirm(`The full amount of रू ${tableOrders.total.toFixed(2)} will be added to customer's credit balance. Continue?`)) {
        return;
      }
    }

    try {
      await tables.payout(selectedTable.id, actualPayment, payoutMethod);
      setShowPayoutModal(false);
      setSelectedTable(null);
      setTableOrders(null);
      setPayoutAmount(0);
      setPayoutMethod('cash');
      loadTables();

      if (payoutMethod === 'credit') {
        alert(`Payout completed! Full amount added to customer credit. They can pay later from Customers or Payments page.`);
      } else {
        alert('Payout completed successfully!');
      }
    } catch (error: any) {
      console.error('Failed to complete payout:', error);
      alert(error.response?.data?.error || 'Failed to complete payout');
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      await tables.delete(tableId);
      loadTables();
      alert('Table deleted successfully');
    } catch (error) {
      console.error('Failed to delete table:', error);
      alert('Failed to delete table');
    }
  };

  const handleAddTable = async () => {
    if (!newTable.name) return;

    try {
      await tables.create(newTable);
      setShowAddModal(false);
      setNewTable({ name: '', position_x: 0, position_y: 0, width: 100, height: 100 });
      loadTables();
      alert('Table added successfully');
    } catch (error) {
      console.error('Failed to add table:', error);
      alert('Failed to add table');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'from-green-400 to-green-600';
      case 'occupied':
        return 'from-red-400 to-red-600';
      case 'reserved':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'free':
        return <Check size={20} />;
      case 'occupied':
        return <Users size={20} />;
      case 'reserved':
        return <Clock size={20} />;
      default:
        return <MapPin size={20} />;
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600 mt-1">Manage your cafe tables and assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Add Table
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900">{tableList.length}</p>
              </div>
              <LayoutGrid size={32} className="text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free</p>
                <p className="text-2xl font-bold text-green-600">
                  {tableList.filter((t) => t.status === 'free').length}
                </p>
              </div>
              <ChefHat size={32} className="text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600">
                  {tableList.filter((t) => t.status === 'occupied').length}
                </p>
              </div>
              <Users size={32} className="text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reserved</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tableList.filter((t) => t.status === 'reserved').length}
                </p>
              </div>
              <Utensils size={32} className="text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tableList.map((table) => (
            <div
              key={table.id}
              className={`bg-gradient-to-br ${getStatusColor(table.status)} rounded-2xl p-6 shadow-xl text-white transform transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-white bg-opacity-30 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {table.status}
              </div>

              {/* Table Header */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-white bg-opacity-30 rounded-full p-2">
                    {getStatusIcon(table.status)}
                  </div>
                  <h3 className="text-3xl font-bold">{table.name}</h3>
                </div>
                <div className="h-1 bg-white bg-opacity-30 rounded-full mb-2"></div>
              </div>

              {/* Customer Info */}
              {(table.customer || table.guest_name) && (
                <div className="mb-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <p className="font-semibold text-sm">
                      {table.customer?.name || table.guest_name || 'Guest'}
                    </p>
                  </div>
                  {table.customer && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Wallet size={14} />
                        Credit Balance:
                      </span>
                      <span className={`font-bold ${table.customer.credit_balance > 0 ? 'text-red-200' : 'text-green-200'}`}>
                        रू {table.customer.credit_balance.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {table.guest_phone && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Phone size={14} />
                      <span>{table.guest_phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state for free tables */}
              {table.status === 'free' && (
                <div className="mb-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <Check size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Available for assignment</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      setShowAssignModal(true);
                    }}
                    className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Users size={16} />
                    {table.status === 'free' ? 'Assign' : 'Change'}
                  </button>

                  {table.status === 'free' && (
                    <button
                      onClick={() => {
                        setSelectedTable(table);
                        setShowReserveModal(true);
                      }}
                      className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Clock size={16} />
                      Reserve
                    </button>
                  )}

                  {table.status === 'occupied' && (
                    <button
                      onClick={async () => {
                        setSelectedTable(table);
                        await loadMenuItems();
                        setNewOrderItems([]);
                        setShowOrderModal(true);
                      }}
                      className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Utensils size={16} />
                      Order
                    </button>
                  )}
                </div>

                {/* Secondary Actions */}
                {table.status === 'occupied' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleShowPayout(table)}
                      className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Coins size={16} />
                      Payout
                    </button>
                    <button
                      onClick={() => handleShowPayout(table)}
                      className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      Payment
                    </button>
                  </div>
                )}

                {/* Delete Button (only for free tables) */}
                {table.status === 'free' ? (
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="w-full bg-red-500 bg-opacity-30 backdrop-blur-sm hover:bg-opacity-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Table
                  </button>
                ) : (
                  <div className="w-full bg-gray-800 bg-opacity-30 px-4 py-2 rounded-lg text-xs text-center opacity-60 cursor-not-allowed">
                    {table.status === 'occupied'
                      ? 'Clear table before deleting'
                      : 'Cancel reservation to delete'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Assign Customer Modal */}
        {showAssignModal && selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
              <h2 className="text-2xl font-bold mb-4">Assign {selectedTable.name}</h2>

              {/* Warning for occupied tables */}
              {selectedTable.status === 'occupied' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Warning:</strong> This table is currently occupied.
                        {selectedTable.customer?.name && ` Current customer: ${selectedTable.customer.name}`}
                        {selectedTable.guest_name && ` Current guest: ${selectedTable.guest_name}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setAssignType('registered')}
                  className={`flex-1 py-2 rounded-lg font-semibold ${assignType === 'registered'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Registered Customer
                </button>
                <button
                  onClick={() => setAssignType('guest')}
                  className={`flex-1 py-2 rounded-lg font-semibold ${assignType === 'guest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Guest
                </button>
              </div>

              {assignType === 'registered' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Customer</label>
                  {selectedTable.status === 'occupied' && (
                    <p className="text-xs text-red-600 mb-2">
                      ⚠️ Changing customer will reassign this table. Current orders will remain linked to the original customer.
                    </p>
                  )}
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    onChange={(e) => {
                      const customerId = e.target.value ? parseInt(e.target.value) : null;
                      if (selectedTable.status === 'occupied' && customerId) {
                        if (!confirm('This table is occupied. Are you sure you want to reassign it to another customer? Existing orders will remain with the current customer.')) {
                          return;
                        }
                      }
                      handleAssignCustomer(customerId, customerId ? 'occupied' : 'free');
                    }}
                    defaultValue={selectedTable.customer_id || ''}
                  >
                    <option value="">No Customer (Free)</option>
                    {customerList.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - रू {customer.credit_balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <button
                    onClick={() => handleAssignCustomer(null, 'occupied')}
                    disabled={!guestName}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
                  >
                    Assign Guest
                  </button>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleAssignCustomer(null, 'free')}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
                >
                  Mark Free
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setGuestName('');
                    setGuestPhone('');
                  }}
                  className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Modal */}
        {showOrderModal && selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8">
              <h2 className="text-2xl font-bold mb-4">Create Order - {selectedTable.name}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Menu</label>
                  {menuCategories.map((category) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {menuItems.filter((i) => i.category === category).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setNewOrderItems((prev) => {
                                const idx = prev.findIndex((p) => p.item_id === item.id);
                                if (idx >= 0) {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
                                  return copy;
                                }
                                return [...prev, { item_id: item.id, item_name: item.name, price: item.price, quantity: 1 }];
                              });
                            }}
                            className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm text-left"
                          >
                            {item.name} - रू {item.price}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {newOrderItems.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    {newOrderItems.map((it, idx) => (
                      <div key={it.item_id} className="flex items-center justify-between mb-2">
                        <span className="flex-1">{it.item_name}</span>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => {
                            const q = parseInt(e.target.value) || 1;
                            setNewOrderItems((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: q } : p)));
                          }}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center mx-2"
                        />
                        <span className="w-24 text-right">रू {(it.price * it.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => setNewOrderItems((prev) => prev.filter((p) => p.item_id !== it.item_id))}
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="text-right font-bold mt-2">
                      Total: रू {newOrderItems.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      if (!selectedTable) return;
                      try {
                        const payload = {
                          table_id: selectedTable.id,
                          customer_id: selectedTable.customer?.id || null,
                          items: newOrderItems.map((i) => ({ item_id: i.item_id, quantity: i.quantity, price: i.price, item_name: i.item_name })),
                        };
                        await orders.create(payload);
                        setShowOrderModal(false);
                        setSelectedTable(null);
                        setNewOrderItems([]);
                        await loadTables();
                        alert('Order created successfully');
                      } catch (err: any) {
                        alert(err.response?.data?.error || 'Failed to create order');
                      }
                    }}
                    disabled={newOrderItems.length === 0}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
                  >
                    Create Order
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedTable(null);
                      setNewOrderItems([]);
                    }}
                    className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payout Modal */}
        {showPayoutModal && selectedTable && tableOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Complete Payout - {selectedTable.name}</h2>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-1">Customer: {selectedTable.customer?.name || selectedTable.guest_name || 'Guest'}</p>
                <p className="text-3xl font-bold text-blue-900">रू {tableOrders.total.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">{tableOrders.orders.length} order(s)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Amount (रू)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payoutMethod === 'credit' ? 0 : payoutAmount}
                    onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                    disabled={payoutMethod === 'credit'}
                    className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-lg ${payoutMethod === 'credit' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                  />
                  {payoutMethod !== 'credit' && payoutAmount < tableOrders.total && (
                    <p className="text-xs text-orange-600 mt-1">
                      Remaining credit: रू {(tableOrders.total - payoutAmount).toFixed(2)}
                    </p>
                  )}
                  {payoutMethod === 'credit' && (
                    <p className="text-xs text-blue-600 mt-1">
                      💳 Full amount रू {tableOrders.total.toFixed(2)} will go to credit
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'online', 'credit'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPayoutMethod(method)}
                        className={`py-2 rounded-lg font-semibold capitalize ${payoutMethod === method ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                  {payoutMethod === 'credit' && (
                    <p className="text-xs text-blue-600 mt-2">
                      💳 Full amount will be added to customer's credit balance. No payment collected now.
                    </p>
                  )}
                </div>

                <div className={`${payoutMethod === 'credit' ? 'bg-blue-50' : 'bg-green-50'} p-3 rounded-lg text-sm ${payoutMethod === 'credit' ? 'text-blue-800' : 'text-green-800'}`}>
                  <p className="font-semibold mb-1">✓ Payout summary</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Total due: रू {tableOrders.total.toFixed(2)}</li>
                    {payoutMethod === 'credit' ? (
                      <>
                        <li>Full amount added to customer credit</li>
                        <li>No payment collected now</li>
                        <li>Customer can pay later from Customers or Payments page</li>
                      </>
                    ) : (
                      <>
                        <li>Collect now ({payoutMethod}): रू {payoutAmount.toFixed(2)}</li>
                        {payoutAmount < tableOrders.total && (
                          <li>Remaining to Customer Credit: रू {(tableOrders.total - payoutAmount).toFixed(2)}</li>
                        )}
                      </>
                    )}
                    <li>Mark all orders billed and free the table</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handlePayout}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-bold shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Coins size={18} />
                    Complete Payout
                  </button>
                  <button
                    onClick={() => alert('Print receipts coming soon')}
                    className="bg-white text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-100 font-semibold flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setShowPayoutModal(false);
                      setSelectedTable(null);
                      setTableOrders(null);
                      setPayoutAmount(0);
                    }}
                    className="bg-gray-300 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reserve Table Modal */}
        {showReserveModal && selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={24} />
                  Reserve {selectedTable.name}
                </h2>
                <button
                  onClick={() => {
                    setShowReserveModal(false);
                    setReserveCustomerId(0);
                    setReserveTime('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <User size={16} />
                    Customer
                  </label>
                  <select
                    value={reserveCustomerId}
                    onChange={(e) => setReserveCustomerId(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Select Customer</option>
                    {customerList.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Reservation Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={reserveTime}
                    onChange={(e) => setReserveTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for immediate reservation</p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Clock size={14} />
                    Table will be marked as reserved for the selected customer
                  </p>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={async () => {
                      if (!reserveCustomerId) {
                        alert('Please select a customer');
                        return;
                      }
                      try {
                        await tables.assignCustomer(selectedTable.id, reserveCustomerId, 'reserved');
                        loadTables();
                        setShowReserveModal(false);
                        setReserveCustomerId(0);
                        setReserveTime('');
                        alert('Table reserved successfully!');
                      } catch (error) {
                        console.error('Failed to reserve table:', error);
                        alert('Failed to reserve table');
                      }
                    }}
                    disabled={reserveCustomerId === 0}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-300 disabled:to-gray-400 font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Clock size={18} />
                    Reserve Table
                  </button>
                  <button
                    onClick={() => {
                      setShowReserveModal(false);
                      setReserveCustomerId(0);
                      setReserveTime('');
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

        {/* Add Table Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
              <h2 className="text-2xl font-bold mb-4">Add New Table</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Table Name</label>
                  <input
                    type="text"
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="e.g., Table 6"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddTable}
                    disabled={!newTable.name}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
                  >
                    Add Table
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div >
    </Layout >
  );
}
