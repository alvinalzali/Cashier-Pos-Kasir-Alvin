"use client";

import { useState, useEffect } from 'react';
import { FiEye, FiPrinter, FiX } from 'react-icons/fi';
import { getAllTransactions, getTransactionById } from '@/services/transactionServices';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenDetail = async (id: number) => {
    try {
        const detail = await getTransactionById(id);
        setSelectedTrx(detail);
    } catch (err: any) {
        const errorBackend = err.response?.data?.message;
        alert(Array.isArray(errorBackend) ? errorBackend.join(", ") : errorBackend || err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // read transaction details dari backend by id
  const detailsArray = selectedTrx?.details || [];
  
  // Total Pcs realtime
  const totalPcs = detailsArray.reduce((acc: number, item: any) => acc + (Number(item.qty) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
        <p className="text-gray-500 text-sm mt-1">Daftar rekaman seluruh penjualan kasir selesai.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-semibold">ID Nota</th>
              <th className="p-4 font-semibold">Waktu</th>
              <th className="p-4 font-semibold">Total Belanja</th>
              <th className="p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center p-8 text-gray-400">Memuat riwayat...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-8 text-gray-400">Belum ada rekaman transaksi harian.</td></tr>
            ) : (
              transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono font-medium text-gray-700">#TRX-{trx.id}</td>
                  <td className="p-4 text-gray-600">
                    {trx.createdAt ? new Date(trx.createdAt).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">
                    Rp {(Number(trx.totalPrice) || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleOpenDetail(trx.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <FiEye />
                      <span>Lihat Struk</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Preview Struk */}
      {selectedTrx && (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body * {
                visibility: hidden;
              }
              #isolated-receipt-zone, #isolated-receipt-zone * {
                visibility: visible;
              }
              #isolated-receipt-zone {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
              }
              #isolated-receipt-zone > div {
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              #receipt-print-area {
                font-size: 14px !important;
                line-height: 1.6;
              }
              #receipt-print-area h3 {
                font-size: 22px !important;
              }
              #receipt-print-area .text-[10px] {
                font-size: 12px !important;
              }
            }
          `}} />

          <div id="isolated-receipt-zone" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:bg-transparent print:static print:p-0">
            <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative print:shadow-none print:p-0 print:border-0">
              <button
                onClick={() => setSelectedTrx(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 print:hidden"
              >
                <FiX className="text-xl" />
              </button>

              <div id="receipt-print-area" className="space-y-4 font-mono text-xs text-gray-800">
                {/* Head Receipt */}
                <div className="text-center border-b border-dashed border-gray-300 pb-3">
                  <h3 className="text-base font-bold">POS KASIR RITEL</h3>
                  <p className="text-gray-500 mt-0.5">Bogor, West Java</p>
                  <div className="text-gray-400 text-[10px] mt-2 space-y-0.5 text-left bg-gray-50 p-2 rounded print:bg-transparent print:p-0">
                    <p>Nota    : #TRX-{selectedTrx.id}</p>
                    <p>Waktu   : {selectedTrx.createdAt ? new Date(selectedTrx.createdAt).toLocaleString('id-ID') : '-'}</p>
                    <p className="font-semibold text-gray-600 print:text-gray-800">
                      Kasir   : {selectedTrx.user?.name || selectedTrx.User?.name || 'Kasir Aktif'}
                    </p>
                  </div>
                </div>

                {/* List Barang Belanja */}
                <div className="divide-y divide-dashed divide-gray-200">
                  {detailsArray.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-[10px]">Tidak ada rincian item belanja.</div>
                  ) : (
                    detailsArray.map((item: any, idx: number) => {
                      // Toleransi penamaan field relation product/products dari Prisma
                      const productName = item.product?.name || item.products?.name || `Produk #${item.productId}`;
                      const itemPrice = Number(item.price) || 0;
                      const itemQty = Number(item.qty) || 0;

                      return (
                        <div key={idx} className="py-2 flex justify-between items-start">
                          <div className="pr-2 max-w-[70%]">
                            <p className="font-medium text-gray-700">{productName}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">
                              {itemQty} pcs x Rp {itemPrice.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <span className="font-semibold text-right whitespace-nowrap">
                            Rp {(itemQty * itemPrice).toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bagian Receipt seperti total tagihan dan kembalian */}
                <div className="border-t border-dashed border-gray-300 pt-3 space-y-1.5">
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Total Kuantitas:</span>
                    <span className="font-medium">{totalPcs} Pcs</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-100">
                    <span>TOTAL TAGIHAN:</span>
                    <span className="text-blue-600 print:text-black">Rp {(Number(selectedTrx.totalPrice) || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tunai (Bayar):</span>
                    <span>Rp {(Number(selectedTrx.moneyPayed) || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kembalian:</span>
                    <span className="font-semibold text-green-600 print:text-black">
                      Rp {(Number(selectedTrx.moneyChanged) || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Footer Receipt */}
                <div className="text-center text-gray-400 text-[10px] pt-4 border-t border-dashed border-gray-200">
                  <p>Terima Kasih Atas Kunjungan Anda</p>
                  <p>Barang yang sudah dibeli tidak dapat ditukar</p>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors print:hidden text-xs"
              >
                <FiPrinter />
                <span>Cetak Receipt (A4 Full Screen)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}