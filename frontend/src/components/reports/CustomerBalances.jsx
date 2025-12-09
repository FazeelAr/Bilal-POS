import React, { useState, useEffect } from "react";
import { apiGet } from "../../api/api";
import {
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Filter,
  SortAsc,
  SortDesc,
  UserCheck,
  UserX,
  UserMinus,
} from "lucide-react";

export default function CustomerBalances() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState({
    customers: [],
    total_balance: 0,
    count: 0,
    positive_balance_count: 0,
    negative_balance_count: 0,
    zero_balance_count: 0,
  });
  const [sortBy, setSortBy] = useState("name"); // 'name' or 'balance'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [filter, setFilter] = useState("all"); // 'all', 'positive', 'negative', 'zero'

  const fetchCustomerBalances = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder,
      });

      const res = await apiGet(`customers/balances/?${params}`);
      if (res && res.data) {
        setBalances(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch customer balances", err);
      setError(err.response?.data?.error || "Failed to load customer balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerBalances();
  }, [sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
  };

  // Filter customers based on selected filter
  const filteredCustomers = balances.customers.filter((customer) => {
    if (filter === "positive") return customer.balance > 0;
    if (filter === "negative") return customer.balance < 0;
    if (filter === "zero") return customer.balance === 0;
    return true; // 'all'
  });

  // Calculate filtered totals
  const filteredTotal = filteredCustomers.reduce(
    (sum, customer) => sum + customer.balance,
    0
  );
  const filteredCount = filteredCustomers.length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg text-center border border-purple-100">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          Loading customer balances...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Users className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-red-900 mb-1">
              Error Loading Balances
            </h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-800">
            Customer Balances
          </h3>
        </div>
        <div className="text-sm text-gray-600">{balances.count} customers</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span>Rs</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p
                className={`text-2xl font-bold ${
                  balances.total_balance > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatCurrency(balances.total_balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Debt (Positive)
              </p>
              <p className="text-2xl font-bold text-red-600">
                {balances.positive_balance_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Customers with balance &gt; 0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Credit (Negative)
              </p>
              <p className="text-2xl font-bold text-green-600">
                {balances.negative_balance_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Customers with balance &lt; 0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Zero Balance</p>
              <p className="text-2xl font-bold text-gray-600">
                {balances.zero_balance_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Customers with balance = 0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>
            <button
              onClick={() => handleFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({balances.count})
            </button>
            <button
              onClick={() => handleFilter("positive")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === "positive"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Debt ({balances.positive_balance_count})
            </button>
            <button
              onClick={() => handleFilter("negative")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === "negative"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Credit ({balances.negative_balance_count})
            </button>
            <button
              onClick={() => handleFilter("zero")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === "zero"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Zero ({balances.zero_balance_count})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => handleSort("name")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                sortBy === "name"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Name
              {sortBy === "name" &&
                (sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </button>
            <button
              onClick={() => handleSort("balance")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                sortBy === "balance"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Balance
              {sortBy === "balance" &&
                (sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Summary */}
      {filter !== "all" && (
        <div
          className={`p-4 rounded-xl border ${
            filter === "positive"
              ? "bg-red-50 border-red-200 text-red-800"
              : filter === "negative"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-gray-50 border-gray-200 text-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {filter === "positive" && <TrendingUp className="w-5 h-5" />}
              {filter === "negative" && <TrendingDown className="w-5 h-5" />}
              {filter === "zero" && <CreditCard className="w-5 h-5" />}
              <span className="font-semibold">
                Showing {filteredCount} {filter} balance{" "}
                {filteredCount === 1 ? "customer" : "customers"}
              </span>
            </div>
            <span className="font-bold">
              Total: {formatCurrency(filteredTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Customer Balances Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Customer
                  </div>
                </th>
                <th className="py-4 px-6 text-right text-sm font-bold text-gray-700">
                  <div className="flex items-center justify-end gap-2">
                    <span>Rs</span>
                    Balance
                  </div>
                </th>
                <th className="py-4 px-6 text-center text-sm font-bold text-gray-700">
                  Orders
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                  Last Order
                </th>
                <th className="py-4 px-6 text-center text-sm font-bold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {customer.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: {customer.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`text-lg font-bold ${
                          customer.balance > 0
                            ? "text-red-600"
                            : customer.balance < 0
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {formatCurrency(customer.balance)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-semibold text-gray-700">
                        {customer.order_count}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600">
                        {formatDate(customer.last_order_date)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          customer.balance > 0
                            ? "bg-red-100 text-red-800"
                            : customer.balance < 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.balance > 0
                          ? "In Debt"
                          : customer.balance < 0
                          ? "In Credit"
                          : "Paid Up"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">
                        No customers found
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {filter === "all"
                          ? "No customers in the system"
                          : `No customers with ${filter} balance`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="py-4 px-6">
                  <span className="font-bold text-gray-800">
                    Total ({filteredCount} customers)
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span
                    className={`text-xl font-bold ${
                      filteredTotal > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(filteredTotal)}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="font-bold text-gray-800">
                    {filteredCustomers.reduce(
                      (sum, c) => sum + c.order_count,
                      0
                    )}
                  </span>
                </td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Balance Insights
        </h4>
        <div className="space-y-3">
          {balances.total_balance > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">
                <span className="font-semibold">Total Debt:</span> Customers owe
                a total of {formatCurrency(balances.total_balance)} to the
                business.
              </p>
            </div>
          )}

          {balances.total_balance < 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                <span className="font-semibold">Total Credit:</span> Business
                owes a total of{" "}
                {formatCurrency(Math.abs(balances.total_balance))} to customers.
              </p>
            </div>
          )}

          {balances.positive_balance_count > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <UserMinus className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                <span className="font-semibold">
                  {balances.positive_balance_count} customers in debt:
                </span>{" "}
                Consider sending payment reminders or offering payment plans.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Tip:</span> Regularly monitor
              customer balances to maintain healthy cash flow and customer
              relationships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
