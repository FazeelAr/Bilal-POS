import React from "react";
import {
  Filter,
  RefreshCw,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ReportFilters({
  filters,
  customers,
  onFilterChange,
  onGenerate,
  onClear,
  loading,
}) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-4 md:p-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">Filters</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-purple-50 rounded-lg"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["daily", "monthly", "range"].map((type) => (
                <button
                  key={type}
                  onClick={() => onFilterChange("reportType", type)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.reportType === type
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Customer
            </label>
            <select
              value={filters.selectedCustomer}
              onChange={(e) =>
                onFilterChange("selectedCustomer", e.target.value)
              }
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filters based on report type */}
          {filters.reportType === "daily" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={filters.dailyDate}
                onChange={(e) => onFilterChange("dailyDate", e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          )}

          {filters.reportType === "monthly" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.monthlyStartDate}
                  onChange={(e) =>
                    onFilterChange("monthlyStartDate", e.target.value)
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.monthlyEndDate}
                  onChange={(e) =>
                    onFilterChange("monthlyEndDate", e.target.value)
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
            </div>
          )}

          {filters.reportType === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.rangeStartDate}
                  onChange={(e) =>
                    onFilterChange("rangeStartDate", e.target.value)
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.rangeEndDate}
                  onChange={(e) =>
                    onFilterChange("rangeEndDate", e.target.value)
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <button
              onClick={onGenerate}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate Report"
              )}
            </button>

            <button
              onClick={onClear}
              className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
