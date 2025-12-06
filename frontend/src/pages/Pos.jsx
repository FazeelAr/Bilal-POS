import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import { useCart } from "../context/useCart";

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const { addToCart, setCurrentCustomer, currentCustomer } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiGet("pricing/products/");
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(
            res.data.map((item) => ({
              productPriceId: item.id,
              productId: item.id,  // ← Use the same ID
              name: item.name,     // ← Changed from product_name to name
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

  if (loading) return <div className="p-5">Loading products...</div>;

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen">
      {/* Header Section with Title and Customer Selection on Right */}
      <div className="flex justify-between items-start mb-6">
        {/* Centered Title */}
        <div className="flex-1"></div> {/* Spacer for centering */}
        <div className="flex-1 text-center">
          <h1 className="text-white text-4xl font-bold mb-1">Point of Sale</h1>
        </div>
        {/* Customer Selection on Right - Smaller */}
        <div className="flex-1 flex justify-end">
          <div className="w-64">
            <label className="block text-white text-sm font-semibold mb-1.5 text-right">
              Select Customer
            </label>
            <div className="relative">
              <select
                value={selectedCustomer}
                onChange={handleCustomerChange}
                className="w-full px-3 py-2.5 rounded-lg border-2 border-white/30 bg-white/95 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-md transition-all duration-200 hover:bg-white"
                disabled={customersLoading}
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
              {customersLoading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Customer Display (if any) */}
      {currentCustomer && (
        <div className="flex justify-end mb-4">
          <div className="w-64 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
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
            {currentCustomer.starting_balance !== undefined && (
              <div className="mt-1.5 text-white/80 text-xs">
                Balance: Rs {currentCustomer.starting_balance.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="flex gap-4 items-start">
        <section className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-2xl font-bold">Products</h3>
            <div className="text-white/80 text-sm">
              {products.length} products available
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
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
        <Cart />
      </div>
    </div>
  );
}
