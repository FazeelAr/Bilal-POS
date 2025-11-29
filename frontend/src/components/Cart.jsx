import React from "react";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Trash2, AlertCircle, Printer, CheckCircle } from "lucide-react";

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
  } = useCart();

  return (
    <aside className="w-[500px] min-h-screen bg-gradient-to-br from-white to-purple-50 p-4 rounded-2xl shadow-lg border border-purple-100 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg text-gray-800 font-bold m-0">Cart</h3>
          <p className="text-xs text-gray-500 m-0">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Your cart is empty</p>
          <p className="text-gray-400 text-xs">Add some products to get started</p>
        </div>
      ) : (
        <div className="pb-28 h-[calc(100vh-200px)] overflow-y-auto pr-2">
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
                  <div className={`font-semibold text-sm mb-1 flex items-center gap-1 ${hasError ? "text-red-700" : "text-gray-800"}`}>
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
                      <label className={`text-[10px] font-bold mb-0.5 block ${hasInvalidQuantity ? "text-red-600" : "text-gray-600"}`}>
                        Weight (Kg)
                      </label>
                      <input
                        type="number"
                        value={displayQty}
                        min="1"
                        step="1"
                        onChange={(e) => updateQuantity(it.productPriceId, e.target.value)}
                        className={`w-full p-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hasInvalidQuantity 
                            ? "border border-red-500 bg-red-50 text-red-700 focus:ring-1 focus:ring-red-200" 
                            : "border border-purple-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                        }`}
                        placeholder="0"
                      />
                      {hasInvalidQuantity && (
                        <span className="text-red-600 text-[9px] font-semibold mt-0.5 block">Must be &gt; 0</span>
                      )}
                    </div>

                    {/* Factor Input */}
                    <div>
                      <label className={`text-[10px] font-bold mb-0.5 block ${hasInvalidFactor ? "text-red-600" : "text-gray-600"}`}>
                        Factor
                      </label>
                      <input
                        type="number"
                        value={displayFactor}
                        min="0.1"
                        step="0.1"
                        onChange={(e) => updateFactor(it.productPriceId, e.target.value)}
                        className={`w-full p-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hasInvalidFactor 
                            ? "border border-red-500 bg-red-50 text-red-700 focus:ring-1 focus:ring-red-200" 
                            : "border border-purple-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                        }`}
                        placeholder="0"
                      />
                      {hasInvalidFactor && (
                        <span className="text-red-600 text-[9px] font-semibold mt-0.5 block">Must be &gt; 0</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Total & Remove */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium">Total</div>
                      <div className={`font-bold text-sm ${hasError ? "text-red-600" : "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"}`}>
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
        <div className={`absolute bottom-0 left-0 right-0 p-4 rounded-b-2xl shadow-lg backdrop-blur-md transition-all duration-200 ${
          isCheckoutDisabled() 
            ? "bg-gradient-to-r from-gray-400 to-gray-500" 
            : "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-white/80 mb-0.5 font-medium">Grand Total</div>
              <div className="text-2xl font-bold text-white mb-0.5">Rs {grandTotal.toFixed(2)}</div>
              {isCheckoutDisabled() ? (
                <div className="flex items-center gap-1 text-[10px] text-white/90 font-semibold bg-white/20 px-2 py-0.5 rounded-full w-fit">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Fix invalid items to checkout
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-white/90 font-semibold">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Ready to checkout
                </div>
              )}
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={isCheckoutDisabled()} 
              type="button" 
              className={`group py-2.5 px-6 rounded-xl border-none font-semibold text-sm shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isCheckoutDisabled() 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70" 
                  : "bg-white text-purple-600 cursor-pointer hover:scale-105 hover:shadow-xl"
              }`}
            >
              {isCheckoutDisabled() ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Cannot Checkout
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Checkout & Print
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}