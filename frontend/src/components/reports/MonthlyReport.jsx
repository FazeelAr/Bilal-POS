import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import OrderDetailReport from "./OrderDetailReport";

export default function MonthlyReport({ reports }) {
  const [expandedMonth, setExpandedMonth] = useState(null);

  // Check if reports is an object with reports array (from backend)
  const isNewFormat = reports && reports.reports;
  const reportsArray = isNewFormat ? reports.reports : reports;
  const customerFilter = isNewFormat ? reports.customer_filter : null;
  const customerBalance = isNewFormat ? reports.customer_balance : null;

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
  const totalSales = reportsArray.reduce(
    (sum, report) => sum + (report.total_sales || 0),
    0
  );

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (reportsArray.length < 2) return 0;
    const current = reportsArray[0]?.total_sales || 0;
    const previous = reportsArray[1]?.total_sales || 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const growth = calculateGrowth();

  const toggleMonthExpansion = (monthIndex) => {
    setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-800">
          Monthly Sales Report
        </h3>
      </div>

      {/* Customer Balance Summary */}
      {customerFilter &&
        customerBalance !== undefined &&
        customerBalance !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-lg font-bold">₹</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Customer Balance
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      customerBalance > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(customerBalance)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Filtered by:{" "}
                    <span className="font-semibold">{customerFilter}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Months</p>
          <p className="text-2xl font-bold text-gray-800">
            {reportsArray.length}
          </p>
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
                Orders
              </th>
              <th className="py-4 px-6 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reportsArray.map((report, index) => (
              <React.Fragment key={index}>
                <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors">
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
                    <span className="font-semibold text-gray-700">
                      {report.order_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {report.orders && report.orders.length > 0 && (
                      <button
                        onClick={() => toggleMonthExpansion(index)}
                        className="p-1 hover:bg-purple-100 rounded text-sm text-purple-600"
                      >
                        {expandedMonth === index ? (
                          <>
                            <ChevronUp className="w-4 h-4 inline mr-1" />
                            Hide Orders
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 inline mr-1" />
                            Show Orders
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
                {/* Expanded Row with Order Details */}
                {expandedMonth === index &&
                  report.orders &&
                  report.orders.length > 0 && (
                    <tr>
                      <td colSpan="4" className="p-0">
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                          <OrderDetailReport
                            orders={report.orders}
                            reportType="monthly"
                            date={report.month}
                            customerName={customerFilter}
                            customerBalance={customerBalance}
                            showBalance={false}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
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
              <td className="py-5 px-6 text-center">
                <span className="text-lg font-bold text-gray-900">
                  {reportsArray.reduce(
                    (sum, report) => sum + (report.order_count || 0),
                    0
                  )}
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Chart Visualization */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Sales Trend
        </h4>
        <div className="h-48 flex items-end gap-2">
          {reportsArray.slice(0, 6).map((report, index) => {
            const maxValue = Math.max(
              ...reportsArray.map((r) => r.total_sales)
            );
            const height =
              maxValue > 0 ? (report.total_sales / maxValue) * 100 : 0;

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
