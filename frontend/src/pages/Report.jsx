import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet } from "../api/api";
import { TrendingUp, Calendar, DollarSign, BarChart3 } from "lucide-react";

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialReport =
    location && location.state && location.state.report
      ? location.state.report
      : null;

  const [loading, setLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [error, setError] = useState(null);

  // Fetch today's daily sales report
  const generateDailyReport = async () => {
    setLoading(true);
    setError(null);
    setDailyReport(null);
    setMonthlyReport(null);

    try {
      const res = await apiGet("sales/reports/daily/");
      setDailyReport(res.data);
    } catch (err) {
      console.error("Daily report fetch failed", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to fetch daily report"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly sales report
  const generateMonthlyReport = async () => {
    setLoading(true);
    setError(null);
    setDailyReport(null);
    setMonthlyReport(null);

    try {
      const res = await apiGet("sales/reports/monthly/");
      setMonthlyReport(res.data);
    } catch (err) {
      console.error("Monthly report fetch failed", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to fetch monthly report"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format month
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sales Reports
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Generate and view your sales analytics</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Daily Report Card */}
          <button
            onClick={generateDailyReport}
            disabled={loading}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-100 hover:border-purple-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-800">Daily Report</h3>
                  <p className="text-sm text-gray-500">Today's sales summary</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-purple-600">Generate Report</span>
                <TrendingUp className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Monthly Report Card */}
          <button
            onClick={generateMonthlyReport}
            disabled={loading}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-pink-100 hover:border-pink-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-800">Monthly Report</h3>
                  <p className="text-sm text-gray-500">Comprehensive monthly data</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-pink-600">Generate Report</span>
                <TrendingUp className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center border border-purple-100">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Generating report...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 shadow-lg mb-8 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Report */}
        {dailyReport && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-purple-100">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white">Daily Sales Report</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Date</p>
                    <p className="text-xl font-semibold text-gray-800">{formatDate(dailyReport.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Sales</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatCurrency(dailyReport.total_sales)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Report */}
        {monthlyReport && monthlyReport.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-pink-100">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white">Monthly Sales Report</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-pink-100">
                      <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="py-4 px-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Total Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReport.map((item, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-800 font-medium">
                          {formatMonth(item.month)}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-gray-900">
                          {formatCurrency(item.total_sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
                      <td className="py-5 px-6 text-lg font-bold text-gray-900">
                        Grand Total
                      </td>
                      <td className="py-5 px-6 text-right text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatCurrency(
                          monthlyReport.reduce((sum, item) => 
                            sum + parseFloat(item.total_sales), 0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!dailyReport && !monthlyReport && !loading && !error && (
          <div className="bg-white rounded-2xl p-16 shadow-lg text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Reports Yet</h3>
              <p className="text-gray-500 mb-2">Generate your first sales report to get started</p>
              <p className="text-sm text-gray-400">Choose from daily or monthly reports above</p>
            </div>
          </div>
        )}

        {/* Back Button */}
        {(dailyReport || monthlyReport) && (
          <div className="flex justify-start mt-8">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-300"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}