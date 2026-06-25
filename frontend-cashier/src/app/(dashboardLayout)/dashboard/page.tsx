"use client";

import { useState, useEffect } from "react";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiAlertTriangle, FiBox } from "react-icons/fi";
import { getAllProducts } from "@/services/productServices";
import { getAllTransactions } from "@/services/transactionServices";

interface ReportState {
  totalSales: number;
  totalTransactions: number;
  topProducts: any[];
  lowStockProducts: any[];
}

export default function DashboardOverview() {
  const [report, setReport] = useState<ReportState>({
    totalSales: 0,
    totalTransactions: 0,
    topProducts: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [productsData, transactionsData] = await Promise.all([
          getAllProducts(),
          getAllTransactions().catch(() => [])
        ]);

        // Filter stok <= 20
        const lowStock = productsData.filter((prod: any) => prod.qty <= 20);

        // Filter transaksihari ini
        const todayStr = new Date().toDateString();
        const todayTransactions = transactionsData.filter((trx: any) => {
          return trx.createdAt ? new Date(trx.createdAt).toDateString() === todayStr : false;
        });

        let sales = 0;
        const productSales: Record<string, { name: string; qty: number }> = {};

        todayTransactions.forEach((trx: any) => {
          sales += Number(trx.totalPrice) || 0;

          if (trx.details && Array.isArray(trx.details)) {
            trx.details.forEach((item: any) => {
              const productId = item.productId;
              if (!productSales[productId]) {
                const matchedMasterProduct = productsData.find((p: any) => p.id === productId);
                
                productSales[productId] = { 
                  name: matchedMasterProduct?.name || item.product?.name || `Produk #${productId}`, 
                  qty: 0 
                };
              }
              productSales[productId].qty += Number(item.qty);
            });
          }
        });

        const sortedTopProducts = Object.values(productSales)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        setReport({
          totalSales: sales,
          totalTransactions: todayTransactions.length,
          topProducts: sortedTopProducts,
          lowStockProducts: lowStock,
        });

      } catch (err: any) {
        setError("Gagal memuat data dari server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Analisis dan metrik performa toko hari ini.</p>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg text-2xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Omset Hari Ini</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? "..." : `Rp ${report.totalSales.toLocaleString('id-ID')}`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg text-2xl">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? "..." : `${report.totalTransactions} Nota`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-lg text-2xl">
            <FiAlertTriangle />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stok Kritis</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? "..." : `${report.lowStockProducts.length} Produk`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-800">
            <FiTrendingUp className="text-blue-600" />
            <span>Produk Terlaris</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Nama</th>
                <th className="p-4 text-right">Terjual</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Loading...</td></tr>
              ) : report.topProducts.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Belum ada data penjualan harian.</td></tr>
              ) : (
                report.topProducts.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-400">#{idx + 1}</td>
                    <td className="p-4 font-semibold text-gray-700">{prod.name}</td>
                    <td className="p-4 text-right text-green-600 font-bold">{prod.qty} Pcs</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stok Tipis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-800">
            <FiBox className="text-amber-500" />
            <span>Peringatan Stok Tipis (≤ 20)</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Nama Produk</th>
                <th className="p-4 text-right">Sisa Stok</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Loading...</td></tr>
              ) : report.lowStockProducts.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-green-600 py-8 font-medium">Semua stok produk aman!</td></tr>
              ) : (
                report.lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 bg-amber-50/10">
                    <td className="p-4 text-xs font-mono text-gray-500">{prod.sku}</td>
                    <td className="p-4 font-semibold text-gray-700">{prod.name}</td>
                    <td className="p-4 text-right">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-bold">
                        {prod.qty} Pcs
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}