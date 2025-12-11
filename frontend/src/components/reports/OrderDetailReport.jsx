import React, { useState } from "react";
import {
  Package,
  Calendar,
  User,
  Hash,
  ShoppingBag,
  CreditCard,
  Printer,
} from "lucide-react";
import { getReceiptByOrderId } from "../../api/api";

// Helper function for payment status styling
const getPaymentStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrderDetailReport({
  orders = [],
  reportType = "daily",
  customerName,
  customerBalance,
  showBalance = true,
}) {
  const [printingOrders, setPrintingOrders] = useState({});

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  // Safely calculate totals
  const totalAmount = (Array.isArray(orders) ? orders : []).reduce(
    (sum, order) => sum + (parseFloat(order?.total || order?.amount) || 0),
    0
  );

  const totalItems = (Array.isArray(orders) ? orders : []).reduce(
    (sum, order) => sum + (parseInt(order?.items_count, 10) || 0),
    0
  );

  const handlePrintReceipt = async (order) => {
    if (!order?.id) {
      console.error("No order ID provided");
      return;
    }

    const orderId = order.id;
    
    // Set loading state for this specific order
    setPrintingOrders(prev => ({ ...prev, [orderId]: true }));

    try {
      // Try to fetch receipt from new Receipt API
      const response = await getReceiptByOrderId(orderId);

      if (response.data && response.data.length > 0) {
        const receipt = response.data[0];

        // Create URL with receipt ID for fetching
        const receiptUrl = `/receipt?print=true&receiptId=${receipt.id}`;
        const receiptWindow = window.open(receiptUrl, '_blank', 'noopener,noreferrer');

        if (receiptWindow) {
          receiptWindow.focus();
        }
      } else {
        // Fallback: use old method with order data
        console.warn('No receipt found, falling back to order data');
        
        // Create receipt payload from order data
        const receiptPayload = {
          items: (order.items || []).map(item => ({
            name: item?.name || "Product",
            qty: parseFloat(item?.quantity) || 0,
            price: parseFloat(item?.price) || 0,
            factor: 1,
            lineTotal: parseFloat(item?.total || (item?.quantity * item?.price)) || 0,
            productId: item?.id || Math.random().toString(36).substring(2, 11)
          })),
          total: parseFloat(order.total || order.amount) || 0,
          createdAt: order.date || order.order_date || new Date().toISOString(),
          customer: {
            name: order.customer_name || order.client?.name || customerName || "Customer",
            balance: parseFloat(customerBalance) || 0,
            starting_balance: parseFloat(customerBalance) || 0
          },
          payment_amount: parseFloat(order.payment_amount) || 0,
          payment_status: order.payment_status || 'paid',
          balance_due: parseFloat(order.balance_due) || 0,
          saleId: order.id
        };

        const encodedPayload = btoa(encodeURIComponent(JSON.stringify(receiptPayload)));
        const receiptUrl = `/receipt?print=true&data=${encodedPayload}&orderId=${order.id}`;
        const receiptWindow = window.open(receiptUrl, '_blank', 'noopener,noreferrer');
        
        if (receiptWindow) {
          receiptWindow.focus();
        }
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      
      // Fallback to original method
      try {
        const receiptPayload = {
          items: (order.items || []).map(item => ({
            name: item?.name || "Product",
            qty: parseFloat(item?.quantity) || 0,
            price: parseFloat(item?.price) || 0,
            factor: 1,
            lineTotal: parseFloat(item?.total || (item?.quantity * item?.price)) || 0,
            productId: item?.id || Math.random().toString(36).substring(2, 11)
          })),
          total: parseFloat(order.total || order.amount) || 0,
          createdAt: order.date || order.order_date || new Date().toISOString(),
          customer: {
            name: order.customer_name || order.client?.name || customerName || "Customer",
            balance: parseFloat(customerBalance) || 0,
            starting_balance: parseFloat(customerBalance) || 0
          },
          payment_amount: parseFloat(order.payment_amount) || 0,
          payment_status: order.payment_status || 'paid',
          balance_due: parseFloat(order.balance_due) || 0,
          saleId: order.id
        };

        const encodedPayload = btoa(encodeURIComponent(JSON.stringify(receiptPayload)));
        const receiptUrl = `/receipt?print=true&data=${encodedPayload}&orderId=${order.id}`;
        const receiptWindow = window.open(receiptUrl, '_blank', 'noopener,noreferrer');
        
        if (receiptWindow) {
          receiptWindow.focus();
        }
      } catch (fallbackError) {
        console.error('Fallback receipt creation failed:', fallbackError);
        alert("Failed to generate receipt. Please try again.");
      }
    } finally {
      // Clear loading state
      setPrintingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const hasOrders = safeOrders.length > 0;
  const hasItems = safeOrders.some(order => Array.isArray(order?.items) && order.items.length > 0);

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
          {safeOrders.length} {safeOrders.length === 1 ? "order" : "orders"}
        </div>
      </div>

      {/* Customer Balance Card */}
      {showBalance && customerBalance !== undefined && customerBalance !== null && (
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
                  className={`text-2xl font-bold ${parseFloat(customerBalance) > 0 ? "text-red-600" : "text-green-600"}`}
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
          <p className="text-2xl font-bold text-gray-800">{safeOrders.length}</p>
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
        {hasOrders ? (
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
                  Amount
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                  Paid
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                  Balance Due
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {safeOrders.map((order) => {
                const orderId = order?.id || `order-${Math.random()}`;
                const items = Array.isArray(order?.items) ? order.items : [];
                const isPrinting = printingOrders[orderId];

                return (
                  <tr
                    key={orderId}
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono font-semibold text-gray-800">
                        #{orderId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-800">
                        {order?.customer_name || order?.client?.name || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">
                        {formatDate(order?.date || order?.order_date)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {(order?.items_count || items.length || 0)} items
                        </span>
                        {items.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {items.slice(0, 2).map((item, idx) => (
                              <span key={idx}>
                                {item?.name || "Item"} ({item?.quantity || 0} ×{" "}
                                {formatCurrency(item?.price)})
                                {idx < Math.min(items.length - 1, 1) ? ", " : ""}
                              </span>
                            ))}
                            {items.length > 2 && (
                              <span>... and {items.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(order?.total || order?.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(order?.payment_amount || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${(parseFloat(order?.balance_due) || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(order?.balance_due || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusClass(order?.payment_status)}`}>
                        {order?.payment_status || 'paid'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        disabled={isPrinting}
                        className={`px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center gap-1 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-300 ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Print Receipt"
                        type="button"
                      >
                        {isPrinting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Printing...
                          </>
                        ) : (
                          <>
                            <Printer className="w-4 h-4" />
                            Print
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
                <td
                  colSpan="4"
                  className="py-5 px-6 text-lg font-bold text-gray-900"
                >
                  Total ({safeOrders.length} orders)
                </td>
                <td className="py-5 px-6" colSpan="5">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatCurrency(totalAmount)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match the selected criteria.</p>
          </div>
        )}
      </div>

      {/* Order Items Details */}
      {hasItems && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Order Items Details
          </h4>
          <div className="space-y-4">
            {safeOrders.map((order) => {
              const items = Array.isArray(order?.items) ? order.items : [];
              if (items.length === 0) return null;
              const orderId = order?.id || `details-${Math.random()}`;
              const isPrinting = printingOrders[orderId];

              return (
                <div key={orderId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold">Order #{order?.id}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        {formatDate(order?.date || order?.order_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(order?.total || order?.amount)}
                      </span>
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        disabled={isPrinting}
                        className={`ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-300 ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Print Receipt"
                        type="button"
                      >
                        {isPrinting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700"></div>
                          </>
                        ) : (
                          <>
                            <Printer className="w-3 h-3" />
                            Print
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{item?.name || "Item"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            {item?.quantity || 0} × {formatCurrency(item?.price || 0)}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(item?.total || (item?.quantity * item?.price) || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}