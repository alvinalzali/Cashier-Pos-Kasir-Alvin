"use client";

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/services/productServices';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: 0,
    qty: 0,
    category: 'Makanan',
    pictureUrl: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data); 
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedId(null);
    setForm({ sku: '', name: '', price: 0, qty: 0, category: 'Makanan', pictureUrl: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setModalType('edit');
    setSelectedId(product.id);
    setForm({
      sku: product.sku || '',
      name: product.name || '',
      price: product.price || 0,
      qty: product.qty || 0,
      category: product.category || 'Makanan',
      pictureUrl: product.pictureUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...form,
      id: selectedId,
      price: Number(form.price),
      qty: Number(form.qty)
    };

    try {
      if (modalType === 'create') {
        await createProduct(payload);
      } else if (modalType === 'edit' && selectedId) {
        await updateProduct(selectedId, payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      const errorBackend = error.response?.data?.message;
      alert(Array.isArray(errorBackend) ? errorBackend.join(", ") : errorBackend || 'Terjadi kesalahan sistem.');
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading produk...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data master inventaris barang toko.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <FiPlus />
          <span>Tambah Produk</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 font-mono text-xs overflow-hidden">
                {product.pictureUrl ? (
                  <img src={product.pictureUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{product.sku}</span>
                )}
              </div>
              <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-400 mt-1">Category: {product.category || 'Umum'}</p>
              
              <div className="mt-3 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                <span className="text-blue-600 font-extrabold text-sm">Rp {product.price.toLocaleString('id-ID')}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${product.qty <= 20 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                  Stok: {product.qty}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-100 pt-3">
              <button
                onClick={() => handleOpenEdit(product)}
                className="flex items-center justify-center space-x-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex items-center justify-center space-x-1 bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors"
              >
                <FiTrash2 />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {modalType === 'create' ? 'Tambah Produk Baru' : 'Ubah Data Produk'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm" autoComplete="off">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500">SKU PRODUK</label>
                <input
                  type="text"
                  required
                  disabled={modalType === 'edit'}
                  autoComplete="off"
                  value={form.sku || ''}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500">NAMA PRODUK</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500">HARGA (RP)</label>
                  <input
                    type="number"
                    required
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500">JUMLAH STOK</label>
                  <input
                    type="number"
                    required
                    value={form.qty || ''}
                    onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500">KATEGORI</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Alat Tulis">Alat Tulis</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500">URL GAMBAR (OPTIONAL)</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.pictureUrl || ''}
                  onChange={(e) => setForm({ ...form, pictureUrl: e.target.value })}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm mt-2"
              >
                {modalType === 'create' ? 'Simpan Produk' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}