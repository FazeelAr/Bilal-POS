import React, { useState } from "react";
import {
  Calendar,
  FileText,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import OrderDetailReport from "./OrderDetailReport";

export default function DateRangeReport({ report }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate average daily sales
  const calculateAverage = () => {
    if (report.daily_breakdown.length === 0) return 0;
    return report.total_sales / report.daily_breakdown.length;
  };

  const averageDaily = calculateAverage();

  const toggleDayExpansion = (dayIndex) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="w-6 h-6 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-800">Date Range Report</h3>
      </div>

      {/* Customer Balance Summary */}
      {report.customer_filter &&
        report.customer_balance !== undefined &&
        report.customer_balance !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-lg font-bold">Rs</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Customer Balance
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      report.customer_balance > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(report.customer_balance)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Filtered by:{" "}
                    <span className="font-semibold">
                      {report.customer_filter}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Date Range Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(report.start_date)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">End Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(report.end_date)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Days</p>
            <p className="text-lg font-semibold text-gray-800">
              {report.daily_breakdown.length}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span>Rs</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(report.total_sales)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <FileText className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-800">
                {report.order_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Daily Sales
              </p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(averageDaily)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Days</p>
              <p className="text-xl font-bold text-green-600">
                {
                  report.daily_breakdown.filter((day) => day.total_sales > 0)
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Filter Info */}
      {report.customer_filter && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Filtered by customer:</span>{" "}
            {report.customer_filter}
          </p>
        </div>
      )}

      {/* Daily Breakdown Table */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Daily Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-purple-100">
                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">
                  Date
                </th>
                <th className="py-3 px-4 text-right text-sm font-bold text-gray-700">
                  Sales
                </th>
                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                  Orders
                </th>
                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {report.daily_breakdown.map((day, index) => (
                <React.Fragment key={index}>
                  <tr className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">
                          {formatDate(day.date)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(day.total_sales)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold">
                        {day.order_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {day.orders && day.orders.length > 0 && (
                        <button
                          onClick={() => toggleDayExpansion(index)}
                          className="p-1 hover:bg-purple-100 rounded text-sm text-purple-600"
                        >
                          {expandedDay === index ? (
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
                  {expandedDay === index &&
                    day.orders &&
                    day.orders.length > 0 && (
                      <tr>
                        <td colSpan="4" className="p-0">
                          <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <OrderDetailReport
                              orders={day.orders}
                              reportType="range"
                              date={day.date}
                              customerName={report.customer_filter}
                              customerBalance={report.customer_balance}
                              showBalance={false}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Orders Summary */}
      {report.orders && report.orders.length > 0 && (
        <div className="mt-8">
          <OrderDetailReport
            orders={report.orders}
            reportType="range"
            date={`${report.start_date} to ${report.end_date}`}
            customerName={report.customer_filter}
            customerBalance={report.customer_balance}
          />
        </div>
      )}

      {/* Summary */}
      {report.daily_breakdown.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-green-800 font-medium">
            Total of{" "}
            <span className="font-bold">{report.daily_breakdown.length}</span>{" "}
            days analyzed.
            {report.daily_breakdown.filter((day) => day.total_sales > 0)
              .length > 0 && (
              <span>
                {" "}
                Sales recorded on{" "}
                {
                  report.daily_breakdown.filter((day) => day.total_sales > 0)
                    .length
                }{" "}
                days.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
