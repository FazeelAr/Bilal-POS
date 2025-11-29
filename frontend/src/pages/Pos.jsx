import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import { useCart } from "../context/CartContext";

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
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
    fetchProducts();
  }, []);

  if (loading) return <div className="p-5">Loading products...</div>;

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen">
      <h1 className="text-white mb-4 text-2xl">Point of Sale</h1>

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
        <Cart />
      </div>
    </div>
  );
}