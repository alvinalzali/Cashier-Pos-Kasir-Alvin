"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { getAllProducts, searchProduct } from '@/services/productServices';
import { getCart, addToCart, updateCartQty, deleteCartItem } from '@/services/cartServices';
import { checkout } from '@/services/transactionServices';

export default function POSCartPage() {
  const router = useRouter();
  const mockUserId = 1;

  const [products, setProducts] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  const loadInitialData = async () => {
    try {
      setLoadingProducts(true);
      const prodData = await getAllProducts();
      setProducts(prodData);
      
      const cartData = await getCart(mockUserId);
      setCartItems(cartData);
    } catch (err: any) {
      setError('Gagal sinkronisasi data dengan server.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!searchQuery.trim()) {
        const prodData = await getAllProducts();
        setProducts(prodData);
        return;
      }
      const searchResult = await searchProduct(searchQuery);
      setProducts(searchResult);
    } catch (err) {
      setError('Produk tidak ditemukan.');
    }
  };

  const handleAddItem = async (productId: number) => {
    try {
      await addToCart(productId, mockUserId);
      const updatedCart = await getCart(mockUserId);
      setCartItems(updatedCart);
    } catch (err: any) {
      const errorBackend = err.response?.data?.message;
      alert(Array.isArray(errorBackend) ? errorBackend.join(", ") : errorBackend || err.message);
    }
  };

  const handleUpdateQty = async (cartId: number, currentQty: number, action: 'inc' | 'dec') => {
    const newQty = action === 'inc' ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;
    try {
      await updateCartQty(cartId, newQty);
      const updatedCart = await getCart(mockUserId);
      setCartItems(updatedCart);
    } catch (err: any) {
      const errorBackend = err.response?.data?.message;
      alert(Array.isArray(errorBackend) ? errorBackend.join(", ") : errorBackend || err.message);
    }
  };

  const handleDeleteItem = async (cartId: number) => {
    try {
      await deleteCartItem(cartId);
      const updatedCart = await getCart(mockUserId);
      setCartItems(updatedCart);
    } catch (err) {
      alert('Gagal menghapus item dari keranjang.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  };

  const handleCheckout = async () => {
    const total = calculateSubtotal();
    if (payAmount < total) {
      alert('Uang pembayaran tidak cukup.');
      return;
    }

    // 1. item keranjang sesuai struktur TransactionDetailsDto backend
    const detailsPayload = cartItems.map((item) => {
      const matchedProduct = products.find(p => p.id === item.productId);
      return {
        productId: Number(item.productId),
        qty: Number(item.qty),
        price: Number(item.product?.price || matchedProduct?.price || 0)
      };
    });

    // 2. Membuat variabel payload sesuai struktur TransactionDto backend
    const transactionPayload = {
      userId: Number(mockUserId),
      moneyPayed: Number(payAmount),
      moneyChanged: Number(payAmount - total),
      totalPrice: Number(total),
      details: detailsPayload
    };

    try {
      await checkout(transactionPayload);
      router.push('/history');
    } catch (err: any) {
      const errorBackend = err.response?.data?.message;
      alert(Array.isArray(errorBackend) ? errorBackend.join(", ") : errorBackend || 'Transaksi gagal. Periksa kembali stok produk.');
    }
  };

  const totalBill = calculateSubtotal();
  const changeAmount = payAmount - totalBill;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {error && <div className="lg:col-span-12 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Kolom kiri : Katalog Produk */}
      <div className="lg:col-span-7 flex flex-col space-y-4 overflow-hidden h-full">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Cari Produk berdasarkan Nama atau SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
        </form>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
          {loadingProducts ? (
            <div className="col-span-full text-center py-8 text-gray-500">Memuat katalog...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">Produk tidak tersedia.</div>
          ) : (
            products.map((product) => {
              const matchedCartItem = cartItems.find(item => item.productId === product.id);
              const qtyInCart = matchedCartItem ? matchedCartItem.qty : 0;

              return (
                <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between shadow-sm relative">
                  <div>
                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 font-mono text-xs">
                      {product.sku}
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">{product.category}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${product.qty <= 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        Stok: {product.qty}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-blue-600 text-sm">Rp {product.price.toLocaleString('id-ID')}</span>
                    
                    <div className="flex items-center space-x-2">
                      {qtyInCart > 0 && (
                        <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md">
                          -{qtyInCart}
                        </span>
                      )}
                      <button
                        onClick={() => handleAddItem(product.id)}
                        disabled={product.qty <= 0 || qtyInCart >= product.qty}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Kolom Kanan: Cart */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm h-full overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center gap-2">
          <FiShoppingBag className="text-blue-600" />
          <span>Daftar Belanja</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Keranjang kosong. Pilih produk di sebelah kiri.</div>
          ) : (
            // salin array dan mengurutkannya secara permanen as ID item keranjang
            [...cartItems]
              .sort((a, b) => a.id - b.id)
              .map((item) => {
                const matchedProduct = products.find(p => p.id === item.productId);
                const maxStockAvailable = matchedProduct?.qty || item.product?.qty || 0;

                return (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex-1 pr-3">
                      <h5 className="font-medium text-gray-800 text-sm">
                        {item.product?.name || matchedProduct?.name || 'Produk Tidak Ditemukan'}
                      </h5>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.qty} x Rp {(item.product?.price || matchedProduct?.price || 0).toLocaleString('id-ID')}
                        <span className="text-gray-400 text-[10px] ml-1.5">(Sisa Stok: {maxStockAvailable})</span>
                      </p>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">
                        Subtotal: Rp {(Number(item.totalPrice) || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleUpdateQty(item.id, item.qty, 'dec')} 
                        className="p-1 border rounded text-gray-600 hover:bg-gray-50"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-center">{item.qty}</span>
                      <button 
                        onClick={() => handleUpdateQty(item.id, item.qty, 'inc')} 
                        disabled={item.qty >= maxStockAvailable}
                        className="p-1 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-2">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
          <div className="flex justify-between font-bold text-gray-800 text-base">
            <span>Total Tagihan:</span>
            <span className="text-blue-600">Rp {totalBill.toLocaleString('id-ID')}</span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Nominal Bayar (Tunai)</label>
            <input
              type="number"
              value={payAmount || ''}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              placeholder="Masukkan jumlah uang..."
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            />
          </div>

          {payAmount > 0 && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-500">Kembalian:</span>
              <span className={`font-bold ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {changeAmount >= 0 ? `Rp ${changeAmount.toLocaleString('id-ID')}` : 'Uang Kurang'}
              </span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || payAmount < totalBill}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm text-sm"
          >
            Proses Selesai & Cetak Nota
          </button>
        </div>
      </div>
    </div>
  );
}