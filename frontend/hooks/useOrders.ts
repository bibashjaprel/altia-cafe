import { useState, useEffect } from 'react';
import { orders } from '@/lib/api';

export function useOrders() {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orders.getAll();
      setOrderList(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await orders.update(orderId, { status });
      await loadOrders();
      return true;
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      return false;
    }
  };

  const deleteOrder = async (orderId: number, orderStatus: string) => {
    if (orderStatus === 'billed') {
      throw new Error('Cannot delete billed orders');
    }

    try {
      await orders.delete(orderId);
      await loadOrders();
      return true;
    } catch (err: any) {
      console.error('Failed to delete order:', err);
      return false;
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return { orderList, loading, error, loadOrders, updateOrderStatus, deleteOrder };
}
