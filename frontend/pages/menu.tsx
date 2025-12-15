import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { menu } from '@/lib/api';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    available: true,
  });

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const loadMenuItems = async () => {
    try {
      const res = await menu.getAll();
      setMenuItems(res.data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await menu.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menu.update(editingItem.id, formData);
      } else {
        await menu.create(formData);
      }
      loadMenuItems();
      loadCategories();
      closeModal();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await menu.delete(id);
      loadMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      available: item.available,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      price: 0,
      description: '',
      available: true,
    });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Menu Item
          </button>
        </div>

        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No menu items yet. Add your first item!</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow p-4 border-l-4 ${item.available ? 'border-green-500' : 'border-red-500'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <span className="text-lg font-bold text-blue-600">रू {item.price}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${item.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Beverages, Main Course"
                    required
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (रू) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="available" className="text-sm font-medium">
                    Available for order
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
