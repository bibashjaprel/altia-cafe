import { useState, useEffect } from 'react';
import { tables } from '@/lib/api';

export function useTables() {
  const [tableList, setTableList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tables.getAll();
      setTableList(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tables');
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (tableId: number, tableStatus: string) => {
    if (tableStatus !== 'free') {
      throw new Error('Cannot delete occupied or reserved tables');
    }

    try {
      await tables.delete(tableId);
      await loadTables();
      return true;
    } catch (err: any) {
      console.error('Failed to delete table:', err);
      return false;
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  return { tableList, loading, error, loadTables, deleteTable };
}
