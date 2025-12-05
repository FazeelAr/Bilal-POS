import React from "react";
import {
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Layers,
} from "lucide-react";

export default function DateRangeReport({ report }) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="w-6 h-6 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-800">Date Range Report</h3>
      </div>

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
              <DollarSign className="w-5 h-5 text-purple-600" />
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {report.daily_breakdown.map((day, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                >
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        day.total_sales > averageDaily
                          ? "bg-green-100 text-green-800"
                          : day.total_sales > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {day.total_sales > averageDaily
                        ? "Above Average"
                        : day.total_sales > 0
                        ? "Normal"
                        : "No Sales"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
