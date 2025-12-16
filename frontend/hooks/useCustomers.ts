import { useState, useEffect } from 'react';
import { customers } from '@/lib/api';

export function useCustomers() {
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customers.getAll();
      setCustomerList(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (customerId: number, creditBalance: number) => {
    if (creditBalance > 0) {
      throw new Error('Cannot delete customer with outstanding balance');
    }

    try {
      await customers.delete(customerId);
      await loadCustomers();
      return true;
    } catch (err: any) {
      console.error('Failed to delete customer:', err);
      return false;
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return { customerList, loading, error, loadCustomers, deleteCustomer };
}
