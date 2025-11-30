import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import { useCart } from "../context/useCart"; // UPDATE IMPORT

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const { addToCart, setCurrentCustomer, currentCustomer } = useCart(); // ADD currentCustomer
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
              name: item.product_name,
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

  const handleAddCustomer = () => {
    navigate("/add-customer");
  };

  if (loading) return <div className="p-5">Loading products...</div>;

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-white text-2xl">Point of Sale</h1>

        {/* Customer Selection Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCustomer}
            onChange={handleCustomerChange}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            disabled={customersLoading}
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddCustomer}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Add Customer
          </button>
        </div>
      </div>

      {/* Show selected customer */}
      {currentCustomer && (
        <div className="mb-4 p-3 bg-white/20 rounded-lg">
          <p className="text-white font-semibold">
            Selected Customer:{" "}
            <span className="text-yellow-300">{currentCustomer.name}</span>
          </p>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <section className="flex-1">
          <h3 className="mt-0 text-white text-xl mb-3">Products</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
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
        <Cart selectedCustomer={currentCustomer || null} />
      </div>
    </div>
  );
}
