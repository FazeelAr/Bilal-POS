import React from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Layers,
} from "lucide-react";

export default function ReportSummary({
  dailyReport,
  monthlyReport,
  rangeReport,
}) {
  const formatCurrency = (amount) => {
    if (!amount) return "Rs 0.00";
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

  // Calculate totals
  const monthlyTotal = monthlyReport.reduce(
    (sum, report) => sum + (report.total_sales || 0),
    0
  );
  const rangeTotal = rangeReport ? rangeReport.total_sales : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-800">Reports Summary</h3>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dailyReport && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Daily Report
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {formatDate(dailyReport.date)}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(dailyReport.total_sales)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {dailyReport.order_count} orders
              </p>
            </div>
          </div>
        )}

        {monthlyReport.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Report
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {monthlyReport.length} months
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {formatCurrency(monthlyTotal)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total across all months
              </p>
            </div>
          </div>
        )}

        {rangeReport && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Layers className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-base font-semibold text-gray-800">
                  {rangeReport.daily_breakdown.length} days
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(rangeTotal)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {rangeReport.order_count} orders
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Quick Insights
        </h4>
        <div className="space-y-3">
          {dailyReport && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Today's Sales:</span>{" "}
                {formatCurrency(dailyReport.total_sales)} from{" "}
                {dailyReport.order_count} orders
              </p>
            </div>
          )}

          {monthlyReport.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Monthly Analysis:</span>{" "}
                {monthlyReport.length} months tracked with total sales of{" "}
                {formatCurrency(monthlyTotal)}
              </p>
            </div>
          )}

          {rangeReport && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Layers className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Date Range:</span>{" "}
                {rangeReport.daily_breakdown.length} days analyzed with average
                daily sales of{" "}
                {formatCurrency(
                  rangeReport.total_sales / rangeReport.daily_breakdown.length
                )}
              </p>
            </div>
          )}

          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Tip:</span> Click on the tabs
              above to view detailed reports or generate new ones using the
              filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
