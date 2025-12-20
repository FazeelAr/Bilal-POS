import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import { useCart } from "../context/useCart";
import { Calendar, User } from "lucide-react";

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const { addToCart, setCurrentCustomer, currentCustomer, setOrderDate: setGlobalOrderDate } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiGet("pricing/products/");

        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(
            res.data.map((item) => ({
              productPriceId: item.id,
              productId: item.product,
              name: item.name,
              price: Number(item.price),
            }))
          );
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn("Failed to fetch products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomers = async () => {
      try {
        const res = await apiGet("customers/");
        if (res && res.data && Array.isArray(res.data)) {
          setCustomers(res.data);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.warn("Failed to fetch customers", err);
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchProducts();
    fetchCustomers();
  }, []);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    const customer = customers.find((c) => c.id === parseInt(customerId));
    setCurrentCustomer(customer || null);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setOrderDate(newDate);
    if (setGlobalOrderDate) {
      setGlobalOrderDate(newDate);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="p-5">Loading products...</div>;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen">
      {/* Top Section - Header and Controls */}
      <div className="p-3 sm:p-4">
        {/* Mobile: Stack header vertically */}
        <div className="block sm:flex justify-between items-start mb-4 sm:mb-6">
          {/* Title - Full width on mobile, centered on desktop */}
          <div className="w-full sm:flex-1 text-center mb-4 sm:mb-0">
            <h1 className="text-white text-2xl sm:text-4xl font-bold mb-1">Point of Sale</h1>
            <div className="text-white/80 text-sm mt-1">
              {formatDate(orderDate)}
            </div>
          </div>

          {/* Controls Container - Full width on mobile, flex row on desktop */}
          <div className="w-full sm:w-auto sm:flex-1 sm:flex sm:justify-end">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Date Selection - Side by side with customer on desktop, stacked on mobile */}
              <div className="w-full sm:w-48">
                <label className="block text-white text-sm font-semibold mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Order Date
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={orderDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]} // Can't select future dates
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-white/30 bg-white/95 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-md transition-all duration-200 hover:bg-white text-sm sm:text-base"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Customer Selection - Side by side with date on desktop, stacked on mobile */}
              <div className="w-full sm:w-64">
                <label className="block text-white text-sm font-semibold mb-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Select Customer
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-white/30 bg-white/95 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-md transition-all duration-200 hover:bg-white text-sm sm:text-base appearance-none"
                    disabled={customersLoading}
                    // Mobile: show as expanded dropdown when clicked
                    size={window.innerWidth < 640 ? 4 : 1}
                    onFocus={(e) => {
                      if (window.innerWidth < 640) {
                        e.target.size = Math.min(customers.length + 1, 6);
                      }
                    }}
                    onBlur={(e) => {
                      if (window.innerWidth < 640) {
                        e.target.size = 1;
                      }
                    }}
                    onClick={(e) => {
                      if (window.innerWidth < 640) {
                        e.target.size = Math.min(customers.length + 1, 6);
                      }
                    }}
                  >
                    <option value="" className="text-gray-500">
                      {customersLoading ? "Loading..." : "Choose customer"}
                    </option>
                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                        className="text-gray-800"
                      >
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  {customersLoading && (
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Customer Display - Only show on larger screens */}
        {currentCustomer && (
          <div className="hidden sm:block w-full sm:w-auto mb-4">
            <div className="w-full sm:w-64 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-md sm:ml-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">
                    Selected Customer
                  </p>
                  <p className="text-yellow-300 text-base font-bold truncate">
                    {currentCustomer.name}
                  </p>
                </div>
                <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {currentCustomer.starting_balance !== undefined && (
                  <div className="text-white/80 text-xs">
                    <span className="font-semibold">Balance:</span> Rs {currentCustomer.starting_balance.toFixed(2)}
                  </div>
                )}
                <div className="text-white/80 text-xs text-right">
                  <span className="font-semibold">Date:</span> {orderDate}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Selected Customer Display - Compact */}
        {currentCustomer && (
          <div className="sm:hidden mb-4">
            <div className="w-full p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-white" />
                    <p className="text-white text-sm font-semibold">
                      Customer:
                    </p>
                  </div>
                  <p className="text-yellow-300 text-base font-bold truncate">
                    {currentCustomer.name}
                  </p>
                  <div className="flex justify-between mt-1">
                    {currentCustomer.starting_balance !== undefined && (
                      <div className="text-white/80 text-xs">
                        <span className="font-semibold">Balance:</span> Rs {currentCustomer.starting_balance.toFixed(2)}
                      </div>
                    )}
                    <div className="text-white/80 text-xs">
                      <span className="font-semibold">Date:</span> {orderDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Section Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-white text-xl sm:text-2xl font-bold">Products</h3>
          <div className="text-white/80 text-xs sm:text-sm">
            {products.length} products available
          </div>
        </div>
      </div>

      {/* Main Content Area - Products and Cart Side by Side */}
      <div className="flex flex-col lg:flex-row">
        {/* Products Grid - Takes full width on mobile, scrolls independently */}
        <section className="w-full lg:flex-1 px-3 sm:px-4 pb-4 lg:pb-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 sm:gap-3">
            {products.map((p) => (
              <ProductCard
                key={p.productPriceId}
                product={p}
                onAdd={() => addToCart(p)}
                onEdit={() => navigate(`/product/${p.productPriceId}`)}
              />
            ))}
          </div>
        </section>

        {/* Cart - Fixed on mobile (overlay), side panel on desktop */}
        <div className="w-full lg:w-[500px] lg:sticky lg:top-0 lg:h-screen">
          <Cart />
        </div>
      </div>
    </div>
  );
}