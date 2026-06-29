"use client";

import { useState, useEffect } from "react";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiAlertTriangle, FiBox, FiCalendar } from "react-icons/fi";
import { getDashboardSummary } from "@/services/dashboardServices";

interface ReportState {
  totalSales: number;
  totalTransactions: number;
  topProducts: { name: string; soldQty: number }[];
  lowStockProducts: { id: number; sku: string; name: string; qty: number }[];
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
  const [range, setRange] = useState("today"); // State untuk rentang waktu

  const fetchDashboardData = async (selectedRange: string) => {
    try {
      setLoading(true);
      setError("");
      
      // data dari backend summary
      const data = await getDashboardSummary(selectedRange);
      setReport(data);

    } catch (err: any) {
      setError("Gagal memuat data dari server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ketika range berubah, refresh
  useEffect(() => {
    fetchDashboardData(range);
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Analisis dan metrik performa toko.</p>
        </div>
        
        {/* Tombol Filter Rentang Waktu */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <FiCalendar className="text-gray-400 ml-2" />
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 py-1.5 px-2 focus:outline-none cursor-pointer"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">1 Bulan Terakhir</option>
            <option value="year">1 Tahun Terakhir</option>
          </select>
        </div>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg text-2xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Omset</p>
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
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Belum ada data penjualan.</td></tr>
              ) : (
                report.topProducts.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-400">#{idx + 1}</td>
                    <td className="p-4 font-semibold text-gray-700">{prod.name}</td>
                    <td className="p-4 text-right text-green-600 font-bold">{prod.soldQty} Pcs</td>
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