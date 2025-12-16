import Layout from '@/components/Layout';
import CreditPaymentForm from '@/components/CreditPaymentForm';
import { useEffect, useState } from 'react';
import { tables, customers, menu, orders } from '@/lib/api';

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
  const [assignType, setAssignType] = useState<'registered' | 'guest'>('registered');
  const [guestName, setGuestName] = useState('');
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
              <CreditPaymentForm
                totalDue={tableOrders.total}
                defaultMethod={payoutMethod as 'cash' | 'online'}
                onSubmit={async (amount, method, notes) => {
                  setPayoutAmount(amount);
                  setPayoutMethod(method);
                  await handlePayout();
                }}
              />

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowPayoutModal(false);
                    setSelectedTable(null);
                    setTableOrders(null);
                    setPayoutAmount(0);
                  }}
                  className="flex-1 bg-gray-300 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => alert('Print receipts coming soon')}
                  className="bg-white text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  🖨️ Print Receipt
                </button>
              </div>
      default:
  return 'from-gray-400 to-gray-600';
}
  };

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'free':
      return '✓';
    case 'occupied':
      return '●';
    case 'reserved':
      return '⏰';
    default:
      return '?';
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
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all transform hover:scale-105"
        >
          + Add Table
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Tables</p>
          <p className="text-2xl font-bold text-gray-900">{tableList.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Free</p>
          <p className="text-2xl font-bold text-green-600">
            {tableList.filter((t) => t.status === 'free').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-2xl font-bold text-red-600">
            {tableList.filter((t) => t.status === 'occupied').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Reserved</p>
          <p className="text-2xl font-bold text-yellow-600">
            {tableList.filter((t) => t.status === 'reserved').length}
          </p>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tableList.map((table) => (
          <div
            key={table.id}
            className={`bg-gradient-to-br ${getStatusColor(table.status)} rounded-2xl p-6 shadow-xl text-white transform transition-all hover:scale-105 hover:shadow-2xl cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center text-2xl">
                  {getStatusIcon(table.status)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{table.name}</h3>
                  <p className="text-sm opacity-90 uppercase tracking-wide">{table.status}</p>
                </div>
              </div>
            </div>

            {(table.customer || table.guest_name) && (
              <div className="mb-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <p className="font-semibold">
                    {table.customer?.name || table.guest_name || 'Guest'}
                  </p>
                </div>
                {table.customer && (
                  <p className="text-sm opacity-90">
                    Credit: रू {table.customer.credit_balance.toFixed(2)}
                  </p>
                )}
                {table.guest_phone && (
                  <p className="text-sm opacity-90">📞 {table.guest_phone}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedTable(table);
                  setShowAssignModal(true);
                }}
                className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                {table.status === 'free' ? 'Assign' : 'Change'}
              </button>
              {table.status === 'occupied' && (
                <button
                  onClick={async () => {
                    setSelectedTable(table);
                    await loadMenuItems();
                    setNewOrderItems([]);
                    setShowOrderModal(true);
                  }}
                  className="flex-1 bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  🍽️ Create Order
                </button>
              )}
              {table.status === 'occupied' && (
                <button
                  onClick={() => handleShowPayout(table)}
                  className="flex-1 bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  💳 Payout
                </button>
              )}
              {table.status === 'occupied' && (
                <button
                  onClick={() => handleShowPayout(table)}
                  className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm transition-all"
                >
                  ⚡ Collect Payment
                </button>
              )}
              <button
                onClick={() => handleDeleteTable(table.id)}
                className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm transition-all"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Customer Modal */}
      {showAssignModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Assign {selectedTable.name}</h2>

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
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={(e) => {
                    const customerId = e.target.value ? parseInt(e.target.value) : null;
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
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg"
                />
                {payoutAmount < tableOrders.total && (
                  <p className="text-xs text-orange-600 mt-1">
                    Remaining credit: रू {(tableOrders.total - payoutAmount).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['cash', 'online'].map((method) => (
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
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                <p className="font-semibold mb-1">✓ Payout summary</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Total due: रू {tableOrders.total.toFixed(2)}</li>
                  <li>Collect now ({payoutMethod}): रू {payoutAmount.toFixed(2)}</li>
                  {payoutAmount < tableOrders.total && (
                    <li>Apply remaining to Customer Credit: रू {(tableOrders.total - payoutAmount).toFixed(2)}</li>
                  )}
                  <li>Mark all orders billed and free the table</li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handlePayout}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-bold shadow-lg transform hover:scale-105 transition-all"
                >
                  Complete Payout
                </button>
                <button
                  onClick={() => alert('Print receipts coming soon')}
                  className="bg-white text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  🖨️ Print Receipt
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
