"use client";

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUploadCloud } from 'react-icons/fi';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/services/productServices';
import { uploadProductImage } from '@/services/uploadServices';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal & Form
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

  // State upload gambar
  const [previewImage, setPreviewImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  // upload gambar
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // max file size
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran gambar terlalu besar. Maksimal 5MB');
      return;
    }

    // preview
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setUploadError('');
    setIsUploading(true);

    try {
      const data = await uploadProductImage(file);
      setForm({ ...form, pictureUrl: data.pictureUrl });
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah gambar.');
      setPreviewImage(''); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setForm({ ...form, pictureUrl: '' });
    setUploadError('');
  };
  // ----------------------------

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedId(null);
    setForm({ sku: '', name: '', price: 0, qty: 0, category: 'Makanan', pictureUrl: '' });
    setPreviewImage(''); 
    setUploadError('');
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
    setPreviewImage(product.pictureUrl || '');
    setUploadError('');
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
    if (isUploading) return; 

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
      
      {/* Card Produk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full items-stretch">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow w-full"
          >
            <div className="flex-1 flex flex-col">
              
              {/* Kunci tinggi kontainer gambar ke h-48 (192px) agar memanjang ke atas */}
              <div className="w-full h-64 bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-gray-400 font-mono text-xs overflow-hidden border border-gray-100 shrink-0">
                {product.pictureUrl ? (
                  <img 
                    src={product.pictureUrl} 
                    alt={product.name} 
                    // w-full h-full object-cover dipaksa tanpa absolute agar mengisi h-48 seutuhnya
                    className="w-full h-full object-cover block" 
                  />
                ) : (
                  <span className="p-4 text-center break-all text-gray-400 bg-gray-100 w-full h-full flex items-center justify-center rounded-lg">
                    {product.sku}
                  </span>
                )}
              </div>
              
              {/* Judul & Kategori Produk */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 line-clamp-2 text-sm leading-tight mb-1" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400">Kategori: {product.category || 'Umum'}</p>
              </div>
            </div>

            {/* Bagian Bawah (Harga, Stok, Tombol) */}
            <div className="mt-auto space-y-3">
              {/* Harga & Stok */}
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                <span className="text-blue-600 font-extrabold text-sm">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${product.qty <= 20 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                  Stok: {product.qty}
                </span>
              </div>

              {/* Tombol Aksi */}
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
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

          </div>
        ))}
      </div>

      {/* Modal Form Tambah/Edit Produk */}
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
              
              {/* Upload Gambar */}
              <div className="space-y-1 mb-4">
                <label className="block text-xs font-semibold text-gray-500">FOTO PRODUK (OPSIONAL)</label>
                {previewImage ? (
                  <div className="relative w-full h-32 border rounded-lg overflow-hidden group bg-gray-50 flex items-center justify-center">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className={`max-h-full object-contain ${isUploading ? 'opacity-50' : 'opacity-100'}`} 
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-blue-600 shadow">
                          Mengunggah...
                        </span>
                      </div>
                    )}
                    {!isUploading && (
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer">
                    <FiUploadCloud className="text-gray-400 text-2xl mb-1" />
                    <span className="text-xs text-gray-500 font-medium">Klik untuk pilih gambar</span>
                    <span className="text-[10px] text-gray-400 mt-1">Maks. 5MB (JPG, PNG)</span>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
                {uploadError && <p className="text-red-500 text-[11px] mt-1">{uploadError}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500">SKU PRODUK</label>
                <input
                  type="text"
                  required
                  disabled={modalType === 'edit'}
                  value={form.sku || ''}
                  placeholder = "Contoh : PROD-002-XYZ"
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500">NAMA PRODUK</label>
                <input
                  type="text"
                  required
                  value={form.name || ''}
                  placeholder = "Contoh : Produk A"
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
                    placeholder = "Contoh : 10000"
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
                    placeholder = "Contoh : 10"
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

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm mt-4"
              >
                {isUploading ? 'Menunggu Upload...' : (modalType === 'create' ? 'Simpan Produk' : 'Simpan Perubahan')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}