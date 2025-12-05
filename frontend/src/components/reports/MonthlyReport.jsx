import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

export default function MonthlyReport({ reports }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Calculate total
  const totalSales = reports.reduce(
    (sum, report) => sum + (report.total_sales || 0),
    0
  );

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (reports.length < 2) return 0;
    const current = reports[0]?.total_sales || 0;
    const previous = reports[1]?.total_sales || 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const growth = calculateGrowth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-800">
          Monthly Sales Report
        </h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Months</p>
          <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Sales</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatCurrency(totalSales)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Growth</p>
          <div className="flex items-center gap-2">
            {growth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`text-xl font-bold ${
                growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-purple-100">
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Month
              </th>
              <th className="py-4 px-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                Total Sales
              </th>
              <th className="py-4 px-6 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-800">
                      {formatMonth(report.month)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="font-bold text-gray-900">
                    {formatCurrency(report.total_sales)}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  {index > 0 && (
                    <div className="inline-flex items-center">
                      {report.total_sales > reports[index - 1]?.total_sales ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600 text-sm font-medium">
                            ↑
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-red-600 text-sm font-medium">
                            ↓
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
              <td className="py-5 px-6 text-lg font-bold text-gray-900">
                Grand Total
              </td>
              <td className="py-5 px-6 text-right">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatCurrency(totalSales)}
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Chart Visualization (Simple bar representation) */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Sales Trend
        </h4>
        <div className="h-48 flex items-end gap-2">
          {reports.slice(0, 6).map((report, index) => {
            const maxValue = Math.max(...reports.map((r) => r.total_sales));
            const height = (report.total_sales / maxValue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-pink-500"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="mt-2 text-xs text-gray-600 font-medium">
                  {report.month.split("-")[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
