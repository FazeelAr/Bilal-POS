import React from "react";
import {
  Package,
  Calendar,
  User,
  Hash,
  ShoppingBag,
  CreditCard,
} from "lucide-react";

export default function OrderDetailReport({
  orders,
  reportType,

  customerName,
  customerBalance,
  showBalance = true,
}) {
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

  // Calculate totals
  const totalAmount = orders.reduce(
    (sum, order) => sum + (order.amount || 0),
    0
  );
  const totalItems = orders.reduce(
    (sum, order) => sum + (order.items_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {reportType === "daily"
                ? "Daily"
                : reportType === "monthly"
                ? "Monthly"
                : "Date Range"}{" "}
              Orders
            </h3>
            {customerName && (
              <p className="text-sm text-gray-600 mt-1">
                Customer: <span className="font-semibold">{customerName}</span>
              </p>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </div>
      </div>

      {/* Customer Balance Card */}
      {showBalance &&
        customerBalance !== undefined &&
        customerBalance !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
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
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders Amount
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Amount</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Items</p>
          <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-purple-100">
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                <Hash className="w-4 h-4 inline mr-2" />
                Order ID
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                <User className="w-4 h-4 inline mr-2" />
                Customer
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                <Package className="w-4 h-4 inline mr-2" />
                Items
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                <span>Rs</span>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <span className="font-mono font-semibold text-gray-800">
                    #{order.id}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-gray-800">
                    {order.customer_name}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-gray-700">
                    {formatDate(order.order_date)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {order.items_count || 0} items
                    </span>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {order.items &&
                        order.items.map((item, idx) => (
                          <span key={idx}>
                            {item.name} ({item.quantity} ×{" "}
                            {formatCurrency(item.price)})
                            {idx < order.items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-gray-900">
                    {formatCurrency(order.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
              <td
                colSpan="4"
                className="py-5 px-6 text-lg font-bold text-gray-900"
              >
                Total ({orders.length} orders)
              </td>
              <td className="py-5 px-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatCurrency(totalAmount)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Order Items Details */}
      {orders.some((order) => order.items && order.items.length > 0) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Order Items Details
          </h4>
          <div className="space-y-4">
            {orders.map(
              (order) =>
                order.items &&
                order.items.length > 0 && (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-semibold">Order #{order.id}</span>
                        <span className="text-sm text-gray-500 ml-3">
                          {formatDate(order.order_date)}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                              {item.quantity} × {formatCurrency(item.price)}
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
