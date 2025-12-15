import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { payments, customers } from '@/lib/api';

interface Payment {
  id: number;
  customer_id: number;
  amount: number;
  method: string;
  notes: string;
  created_at: string;
  customer?: any;
  order?: any;
}

export default function Payments() {
  const [paymentList, setPaymentList] = useState<Payment[]>([]);
  const [customerList, setCustomerList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    customer_id: 0,
    amount: 0,
    method: 'cash',
    notes: '',
  });

  useEffect(() => {
    loadPayments();
    loadCustomers();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await payments.getAll();
      setPaymentList(res.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
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

  const handleAddPayment = async () => {
    try {
      await payments.create(newPayment);
      loadPayments();
      loadCustomers(); // Reload to update credit balances
      setShowAddModal(false);
      setNewPayment({ customer_id: 0, amount: 0, method: 'cash', notes: '' });
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Record Payment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentList.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.customer?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    रू {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {payment.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Credit Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Customer Credit Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customerList
              .filter((c: any) => c.credit_balance > 0)
              .map((customer: any) => (
                <div key={customer.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                  <p className="text-lg font-bold text-red-600 mt-2">
                    Outstanding: रू {customer.credit_balance.toFixed(2)}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Add Payment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Record Payment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select
                    value={newPayment.customer_id}
                    onChange={(e) => setNewPayment({ ...newPayment, customer_id: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value={0}>Select Customer</option>
                    {customerList.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - Outstanding: रू {customer.credit_balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount (रू)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI/eSewa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Optional notes"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddPayment}
                    disabled={newPayment.customer_id === 0 || newPayment.amount <= 0}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Record Payment
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
      </div>
    </Layout>
  );
}
