import Layout from '@/components/Layout';
import { cafes } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Cafe {
  id: number;
  name: string;
  subdomain: string;
  active: boolean;
}

export default function CafesAdmin() {
  const [list, setList] = useState<Cafe[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Cafe>>({ name: '', subdomain: '', active: true });
  const [editing, setEditing] = useState<Cafe | null>(null);

  const load = async () => {
    try {
      const res = await cafes.getAll();
      setList(res.data || []);
    } catch (e) {
      console.error('Failed to load cafes', e);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', subdomain: '', active: true }); setShowModal(true); };
  const openEdit = (c: Cafe) => { setEditing(c); setForm({ name: c.name, subdomain: c.subdomain, active: c.active }); setShowModal(true); };

  const submit = async () => {
    try {
      if (!form.name || !form.subdomain) { alert('Name and subdomain are required'); return; }
      if (editing) {
        await cafes.update(editing.id, form);
      } else {
        await cafes.create(form);
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to save');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this cafe?')) return;
    try {
      await cafes.delete(id);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cafes</h1>
            <p className="text-gray-600 mt-1">Manage tenant cafes and subdomains</p>
          </div>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ New Cafe</button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subdomain</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.subdomain}</td>
                  <td className="px-4 py-3">{c.active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="px-3 py-1 bg-gray-200 rounded mr-2">Edit</button>
                    <button onClick={() => remove(c.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
              <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit Cafe' : 'New Cafe'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subdomain</label>
                  <input type="text" value={form.subdomain || ''} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div className="flex items-center">
                  <input id="active" type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="mr-2" />
                  <label htmlFor="active" className="text-sm">Active</label>
                </div>
                <div className="flex space-x-2">
                  <button onClick={submit} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
