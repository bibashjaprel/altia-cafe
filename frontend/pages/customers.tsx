import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { customers } from '@/lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Phone,
  User,
  Wallet,
  CreditCard,
  PrinterIcon,
  DollarSign,
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone: string;
  credit_balance: number;
}

export default function Customers() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '' });
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await customers.getAll();
      setCustomerList(res.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await customers.create(newCustomer);
      loadCustomers();
      setShowAddModal(false);
      setNewCustomer({ name: '', phone: '' });
    } catch (error) {
      console.error('Failed to add customer:', error);
      alert('Failed to add customer');
    }
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFormData({ name: customer.name, phone: customer.phone });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    if (!editFormData.name || !editFormData.phone) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await customers.update(selectedCustomer.id, editFormData);
      loadCustomers();
      setShowEditModal(false);
      setSelectedCustomer(null);
      alert('Customer updated successfully');
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    // Block deletion if customer has outstanding balance
    if (customer.credit_balance > 0) {
      alert(`Cannot delete customer with outstanding balance of रू ${customer.credit_balance.toFixed(2)}. Please clear the balance first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${customer.name}?`)) return;

    try {
      await customers.delete(customer.id);
      loadCustomers();
      alert('Customer deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete customer:', error);
      alert(error.response?.data?.error || 'Failed to delete customer');
    }
  };

  const handleOpenPayment = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount(0);
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  const handleCollectPayment = async () => {
    if (!selectedCustomer || paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Here you would call a payment API endpoint
      // For now, we'll create a receipt data
      setReceiptData({
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        amount: paymentAmount,
        method: paymentMethod,
        previousBalance: selectedCustomer.credit_balance,
        newBalance: selectedCustomer.credit_balance - paymentAmount,
        timestamp: new Date(),
        receiptNo: `RCP-${Date.now()}`,
      });
      setShowPaymentModal(false);
      setShowReceiptModal(true);
    } catch (error) {
      console.error('Failed to collect payment:', error);
      alert('Failed to collect payment');
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptData.receiptNo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .receipt { max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .title { font-size: 20px; font-weight: bold; }
              .subtitle { font-size: 14px; color: #666; }
              .content { margin: 20px 0; }
              .line { display: flex; justify-content: space-between; margin: 8px 0; }
              .label { font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="title">CAFE RECEIPT</div>
                <div class="subtitle">Payment Collection</div>
              </div>
              <div class="content">
                <div class="line">
                  <span class="label">Receipt No:</span>
                  <span>${receiptData.receiptNo}</span>
                </div>
                <div class="line">
                  <span class="label">Customer:</span>
                  <span>${receiptData.customerName}</span>
                </div>
                <div class="line">
                  <span class="label">Phone:</span>
                  <span>${receiptData.customerPhone}</span>
                </div>
                <div class="line">
                  <span class="label">Date/Time:</span>
                  <span>${receiptData.timestamp.toLocaleString('en-NP')}</span>
                </div>
              </div>
              <div style="border-top: 1px dashed #000; padding: 10px 0; margin: 10px 0;">
                <div class="line">
                  <span class="label">Payment Method:</span>
                  <span>${receiptData.method.toUpperCase()}</span>
                </div>
                <div class="line">
                  <span class="label">Previous Balance:</span>
                  <span>रू ${receiptData.previousBalance.toFixed(2)}</span>
                </div>
                <div class="line" style="border-bottom: 2px solid #000; padding-bottom: 8px;">
                  <span class="label">Amount Paid:</span>
                  <span>रू ${receiptData.amount.toFixed(2)}</span>
                </div>
                <div class="line" style="font-weight: bold; font-size: 16px; margin-top: 8px;">
                  <span>New Balance:</span>
                  <span>रू ${receiptData.newBalance.toFixed(2)}</span>
                </div>
              </div>
              <div class="footer">
                <p style="margin: 5px 0;">Thank you for your payment!</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">Cafe Management System</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage customer information and collect payments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customerList.length}</p>
              </div>
              <User size={32} className="text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Credit Due</p>
                <p className="text-2xl font-bold text-red-600">
                  रू {customerList.reduce((sum, c) => sum + (c.credit_balance > 0 ? c.credit_balance : 0), 0).toFixed(2)}
                </p>
              </div>
              <Wallet size={32} className="text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Up Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {customerList.filter(c => c.credit_balance <= 0).length}
                </p>
              </div>
              <CreditCard size={32} className="text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    Phone
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} />
                    Credit Balance
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 hover:bg-gray-50">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User size={48} className="text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No customers yet</p>
                      <p className="text-gray-400 text-sm">Add your first customer to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customerList.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${customer.credit_balance > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        <DollarSign size={14} />
                        रू {customer.credit_balance.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleOpenEdit(customer)}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit customer"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenPayment(customer)}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors"
                        title="Collect payment"
                      >
                        <CreditCard size={16} />
                        Payment
                      </button>
                      {customer.credit_balance > 0 ? (
                        <button
                          disabled
                          title={`Cannot delete customer with outstanding balance of रू ${customer.credit_balance.toFixed(2)}`}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 px-3 py-1 rounded-lg cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Ramesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="98XXXXXXXX"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddCustomer}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                  >
                    <Save size={18} />
                    Add Customer
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Customer</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleUpdateCustomer}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                  >
                    <Save size={18} />
                    Update
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Collection Modal */}
        {showPaymentModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Collect Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-1">Customer: {selectedCustomer.name}</p>
                <p className="text-3xl font-bold text-blue-900">रू {selectedCustomer.credit_balance.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">Current credit balance due</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      Payment Amount (रू)
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {paymentAmount > selectedCustomer.credit_balance && (
                    <p className="text-sm text-orange-600 mt-1">⚠️ Amount exceeds credit balance</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      Payment Method
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['cash', 'online'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 rounded-lg font-semibold capitalize transition-all ${paymentMethod === method
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {method === 'cash' ? '💵' : '🔗'} {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">✓ Payment Summary</p>
                  <div className="space-y-1 text-xs text-green-800">
                    <div className="flex justify-between">
                      <span>Current Balance:</span>
                      <span>रू {selectedCustomer.credit_balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-green-300 pt-1 mt-1">
                      <span>Amount to Collect:</span>
                      <span>रू {paymentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600">
                      <span>New Balance:</span>
                      <span>रू {Math.max(0, selectedCustomer.credit_balance - paymentAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCollectPayment}
                    disabled={paymentAmount <= 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard size={18} />
                    Collect Payment
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && receiptData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 space-y-3 mb-4 border-2 border-amber-200">
                <div className="text-center border-b-2 border-dashed border-amber-300 pb-3">
                  <p className="text-sm text-amber-900 font-bold">CAFE RECEIPT</p>
                  <p className="text-xs text-amber-700">{receiptData.receiptNo}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Customer:</span>
                    <span className="font-semibold">{receiptData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Phone:</span>
                    <span className="font-semibold">{receiptData.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Method:</span>
                    <span className="font-semibold uppercase">{receiptData.method}</span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-amber-300 pt-3">
                  <div className="flex justify-between font-bold text-gray-800 mb-2">
                    <span>Amount Paid:</span>
                    <span className="text-lg">रू {receiptData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Previous Balance:</span>
                    <span>रू {receiptData.previousBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-green-700 bg-green-50 px-2 py-1 rounded">
                    <span>New Balance:</span>
                    <span>रू {receiptData.newBalance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center border-t-2 border-dashed border-amber-300 pt-3">
                  <p className="text-xs text-gray-600">{receiptData.timestamp.toLocaleString('en-NP')}</p>
                  <p className="text-xs text-gray-500 mt-1">Thank you for your payment!</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <PrinterIcon size={18} />
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    loadCustomers();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

