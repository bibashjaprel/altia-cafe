import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { tables, customers } from '@/lib/api';

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

  useEffect(() => {
    loadTables();
    loadCustomers();
  }, []);

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
      setGuestName('');
      setGuestPhone('');
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

    try {
      await tables.payout(selectedTable.id, payoutAmount, payoutMethod, `Payout for ${selectedTable.name}`);
      loadTables();
      setShowPayoutModal(false);
      setSelectedTable(null);
      setTableOrders(null);
      setPayoutAmount(0);
      alert('Payout completed successfully!');
    } catch (error: any) {
      console.error('Failed to complete payout:', error);
      alert(error.response?.data?.error || 'Failed to complete payout');
    }
  };

  const handleAddTable = async () => {
    try {
      await tables.create(newTable);
      loadTables();
      setShowAddModal(false);
      setNewTable({ name: '', position_x: 0, position_y: 0, width: 100, height: 100 });
    } catch (error) {
      console.error('Failed to add table:', error);
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      await tables.delete(id);
      loadTables();
    } catch (error) {
      console.error('Failed to delete table:', error);
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
                    onClick={() => handleShowPayout(table)}
                    className="flex-1 bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    💳 Payout
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
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'card', 'upi'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPayoutMethod(method)}
                        className={`py-2 rounded-lg font-semibold capitalize ${payoutMethod === method
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                  <p className="font-semibold mb-1">✓ This will:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Mark all orders as billed</li>
                    <li>Record payment of रू {payoutAmount.toFixed(2)}</li>
                    {payoutAmount < tableOrders.total && (
                      <li>Add रू {(tableOrders.total - payoutAmount).toFixed(2)} to customer credit</li>
                    )}
                    <li>Free the table</li>
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
