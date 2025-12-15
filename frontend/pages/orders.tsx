import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { orders, tables, customers, menu, payments } from '@/lib/api';

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
  const [tableList, setTableList] = useState<{ id: number; name: string }[]>([]);
  const [customerList, setCustomerList] = useState<{ id: number; name: string }[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

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

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await orders.update(id, { status });
      loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
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
        return 'bg-yellow-100 text-yellow-800';
      case 'served':
        return 'bg-blue-100 text-blue-800';
      case 'billed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + New Order
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderList.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.table?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    रू {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'served')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Mark Served
                      </button>
                    )}
                    {order.status === 'served' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'billed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Mark Billed
                        </button>
                        <button
                          onClick={() => handleBillAndPay(order)}
                          className="text-purple-600 hover:text-purple-900 font-semibold"
                        >
                          Bill & Pay
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
              <h2 className="text-xl font-bold mb-4">New Order</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Table Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Table</label>
                    <select
                      value={newOrder.table_id}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, table_id: parseInt(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    <label className="block text-sm font-medium mb-1">Customer</label>
                    <select
                      value={newOrder.customer_id}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, customer_id: parseInt(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                  <label className="block text-sm font-medium mb-2">Menu Items</label>
                  {menuCategories.map((category) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {menuItems
                          .filter((item) => item.category === category)
                          .map((item) => (
                            <button
                              key={item.id}
                              onClick={() => addMenuItem(item)}
                              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm text-left"
                            >
                              {item.name} - रू {item.price}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Items */}
                {newOrder.items.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between mb-2">
                        <span className="flex-1">{item.item_name}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center mx-2"
                        />
                        <span className="w-20 text-right">रू {(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeMenuItem(index)}
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-bold text-right">
                      Total: रू {getTotal().toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddOrder}
                    disabled={
                      newOrder.table_id === 0 || newOrder.customer_id === 0 || newOrder.items.length === 0
                    }
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Create Order
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Complete Bill & Payment</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Order #{selectedOrder.id}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600">Table: {selectedOrder.table?.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    Total: रू {selectedOrder.total.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Amount (रू)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining credit: रू {(selectedOrder.total - paymentAmount).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI/eSewa</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    ✓ Order will be marked as billed
                    <br />
                    {paymentAmount > 0 && `✓ Payment of रू ${paymentAmount.toFixed(2)} will be recorded`}
                    <br />
                    {paymentAmount < selectedOrder.total &&
                      `✓ Credit balance: रू ${(selectedOrder.total - paymentAmount).toFixed(2)}`}
                    <br />
                    ✓ Table will be freed
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={completeBillAndPayment}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                  >
                    Complete Bill & Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowBillModal(false);
                      setSelectedOrder(null);
                      setPaymentAmount(0);
                    }}
                    className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
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
