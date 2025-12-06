import React, { useState } from "react";
import { useCart } from "../context/useCart";
import {
  ShoppingCart,
  Trash2,
  AlertCircle,
  Printer,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";

export default function Cart() {
  const {
    cart,
    updateQuantity,
    updateFactor,
    removeFromCart,
    itemTotal,
    grandTotal,
    isCheckoutDisabled,
    handleCheckout,
    currentCustomer,
    clearCart,
    clearCustomer,
  } = useCart();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (isCheckoutDisabled()) {
      if (!currentCustomer) {
        alert("Please select a customer before payment");
      } else {
        alert("Cannot checkout: fix invalid items");
      }
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const payment = parseFloat(paymentAmount);
    if (isNaN(payment) || payment <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (payment > grandTotal) {
      alert("Payment amount cannot be greater than total amount");
      return;
    }

    setProcessingPayment(true);

    try {
      const items = cart.map((it) => ({
        product: it.productId,
        quantity: Number(it.qty),
        factor: Number(it.factor) || 1,
        price: (Number(it.price) || 0) * (Number(it.factor) || 1),
      }));

      const payment_status = payment === grandTotal ? "paid" : "partial";
      const balance_due = grandTotal - payment;

      const payload = {
        items,
        customer: currentCustomer.id,
        payment_amount: payment,
        payment_method: "cash",
        payment_status: payment_status,
        total_amount: grandTotal,
        balance_due: balance_due,
      };

      let backendOrder = null;

      try {
        const res = await apiPost("sales/orders/create-with-payment/", payload);
        backendOrder = res.data;
      } catch (err) {
        console.error("Payment checkout failed", err);
        alert("Payment failed. Please try again or contact support.");
        setProcessingPayment(false);
        return;
      }

      const itemsPayload = cart.map((it) => {
        const qty = Number(it.qty) || 0;
        const factor = Number(it.factor) || 1;
        const price = Number(it.price) || 0;
        const lineTotal = price * qty * factor;
        return {
          productPriceId: it.productPriceId,
          productId: it.productId,
          name: it.name,
          qty,
          factor,
          price,
          lineTotal,
        };
      });

      const receiptPayload = {
        items: itemsPayload,
        total: grandTotal,
        createdAt: new Date().toISOString(),
        customer: currentCustomer,
        payment_amount: payment,
        balance_due: balance_due,
        payment_status: payment_status,
      };

      navigate("/receipt", {
        state: {
          payload: receiptPayload,
          response: backendOrder,
          message:
            payment_status === "paid"
              ? "Payment completed successfully!"
              : "Partial payment received!",
        },
      });

      clearCart();
      clearCustomer();
    } catch (err) {
      console.error("Payment error", err);
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleFullPayment = () => {
    setPaymentAmount(grandTotal.toFixed(2));
  };

  const calculateChange = () => {
    const payment = parseFloat(paymentAmount);
    if (isNaN(payment) || payment <= 0) return 0;
    if (payment < grandTotal) return 0;
    return payment - grandTotal;
  };

  const changeAmount = calculateChange();

  return (
    <aside className="w-[500px] min-h-screen bg-gradient-to-br from-white to-purple-50 p-4 rounded-2xl shadow-lg border border-purple-100 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg text-gray-800 font-bold m-0">Cart</h3>
          <p className="text-xs text-gray-500 m-0">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">
            Your cart is empty
          </p>
          <p className="text-gray-400 text-xs">
            Add some products to get started
          </p>
        </div>
      ) : (
        <div className="pb-48 h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {cart.map((it) => {
              const quantity = Number(it.qty) || 0;
              const factor = Number(it.factor) || 0;
              const hasInvalidQuantity = !quantity || quantity <= 0;
              const hasInvalidFactor = !factor || factor <= 0;
              const hasError = hasInvalidQuantity || hasInvalidFactor;

              const displayQty = quantity > 0 ? quantity : "";
              const displayFactor = factor > 0 ? factor : "";

              return (
                <div
                  key={it.productPriceId}
                  className={`relative p-3 rounded-xl shadow-sm transition-all duration-200 ${
                    hasError
                      ? "bg-gradient-to-r from-red-50 to-pink-50 border border-red-300"
                      : "bg-white border border-purple-100 hover:shadow-md hover:border-purple-200"
                  }`}
                >
                  {/* Error Indicator */}
                  {hasError && (
                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 shadow">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Product Name */}
                  <div
                    className={`font-semibold text-sm mb-1 flex items-center gap-1 ${
                      hasError ? "text-red-700" : "text-gray-800"
                    }`}
                  >
                    <span className="line-clamp-1">{it.name}</span>
                    {hasError && (
                      <span className="text-[10px] text-red-600 font-semibold px-1.5 py-0.5 bg-red-100 rounded-full">
                        Fix
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Rs {Number(it.price || 0).toFixed(2)}/kg
                  </div>

                  {/* Inputs */}
                  <div className="space-y-2 mb-3">
                    {/* Quantity Input */}
                    <div>
                      <label
                        className={`text-[10px] font-bold mb-0.5 block ${
                          hasInvalidQuantity ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        Weight (Kg)
                      </label>
                      <input
                        type="number"
                        value={displayQty}
                        min="1"
                        step="1"
                        onChange={(e) =>
                          updateQuantity(it.productPriceId, e.target.value)
                        }
                        className={`w-full p-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hasInvalidQuantity
                            ? "border border-red-500 bg-red-50 text-red-700 focus:ring-1 focus:ring-red-200"
                            : "border border-purple-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                        }`}
                        placeholder="0"
                      />
                      {hasInvalidQuantity && (
                        <span className="text-red-600 text-[9px] font-semibold mt-0.5 block">
                          Must be &gt; 0
                        </span>
                      )}
                    </div>

                    {/* Factor Input */}
                    <div>
                      <label
                        className={`text-[10px] font-bold mb-0.5 block ${
                          hasInvalidFactor ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        Factor
                      </label>
                      <input
                        type="number"
                        value={displayFactor}
                        min="0.1"
                        step="0.1"
                        onChange={(e) =>
                          updateFactor(it.productPriceId, e.target.value)
                        }
                        className={`w-full p-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hasInvalidFactor
                            ? "border border-red-500 bg-red-50 text-red-700 focus:ring-1 focus:ring-red-200"
                            : "border border-purple-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                        }`}
                        placeholder="0"
                      />
                      {hasInvalidFactor && (
                        <span className="text-red-600 text-[9px] font-semibold mt-0.5 block">
                          Must be &gt; 0
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Total & Remove */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        Total
                      </div>
                      <div
                        className={`font-bold text-sm ${
                          hasError
                            ? "text-red-600"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                        }`}
                      >
                        Rs {itemTotal(it).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(it.productPriceId)}
                      className="group p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-none text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all duration-200"
                      title="Remove item"
                    >
                      <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Checkout Footer */}
      {cart.length > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 rounded-b-2xl shadow-lg backdrop-blur-md transition-all duration-200 ${
            isCheckoutDisabled()
              ? "bg-gradient-to-r from-gray-400 to-gray-500"
              : "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
          }`}
        >
          <div className="space-y-4">
            {/* Total Display */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-white/80 mb-0.5 font-medium">
                  Grand Total
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">
                  Rs {grandTotal.toFixed(2)}
                </div>
                {isCheckoutDisabled() ? (
                  <div className="flex items-center gap-1 text-[10px] text-white/90 font-semibold bg-white/20 px-2 py-0.5 rounded-full w-fit">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Fix invalid items to checkout
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-white/90 font-semibold">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Ready for payment
                  </div>
                )}
              </div>
            </div>

            {/* Payment Input Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-white/80 font-medium mb-1">
                    Payment Amount (Rs)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="w-4 h-4 text-white/70" />
                    </div>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleFullPayment}
                  className="mt-6 px-3 py-2.5 bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors duration-200"
                  title="Set payment to full amount"
                >
                  Full
                </button>
              </div>

              {/* Change Display */}
              {changeAmount > 0 && (
                <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">
                      Change Due:
                    </span>
                    <span className="text-green-300 text-lg font-bold">
                      Rs {changeAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Button Row */}
              <div className="flex gap-2">
                <button
                  onClick={handlePayment}
                  disabled={
                    isCheckoutDisabled() ||
                    !paymentAmount ||
                    parseFloat(paymentAmount) <= 0 ||
                    processingPayment
                  }
                  className={`flex-1 py-3 px-4 rounded-xl border-none font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCheckoutDisabled() ||
                    !paymentAmount ||
                    parseFloat(paymentAmount) <= 0 ||
                    processingPayment
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-pointer hover:scale-105 hover:shadow-xl"
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Process Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
