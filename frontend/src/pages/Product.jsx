import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPatch } from "../api/api";
import { useCart } from "../context/CartContext";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Fetch the specific product from the list (since there's no detail endpoint)
        const res = await apiGet(`pricing/products/`);
        if (res?.data) {
          // Find the product with matching id
          const foundProduct = res.data.find(p => p.id === parseInt(id));
          if (foundProduct) {
            setProduct(foundProduct);
            setPrice(foundProduct.price ?? "");
          } else {
            alert("Product not found");
            navigate("/pos");
          }
        }
      } catch (err) {
        console.error("Failed to load product", err);
        alert("Failed to load product");
        navigate("/pos");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  // -----------------------------
  // Save price using PATCH
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPatch(`pricing/products/${id}/update-price/`, {
        price: Number(price),
      });
      alert("Price updated successfully!");
      navigate("/pos");
    } catch (err) {
      console.error("Failed to update price", err);
      alert("Failed to update price.");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Add to Cart
  // -----------------------------
  const handleAddToCart = () => {
    addToCart({
      id: product?.id ?? id,
      name: product?.product_name ?? "Unknown",
      price: Number(price) || 0,
    });
    navigate("/pos");
  };

  if (loading) return <div className="p-5">Loading product...</div>;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Product</h2>
      <div className="max-w-[520px] bg-white p-4 rounded-lg shadow-md">
        <div className="mb-3">
          <strong className="text-gray-700">Name:</strong>
          <div className="mt-1.5 text-gray-800">{product?.product_name}</div>
        </div>

        <div className="mb-3">
          <label className="block mb-1.5 text-gray-700 font-medium">
            Price (Rs)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="py-2 px-3.5 rounded-md bg-indigo-500 text-white border-none font-semibold disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="py-2 px-3.5 rounded-md border border-gray-300 bg-white text-gray-700 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}