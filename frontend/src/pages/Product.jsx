import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPatch } from "../api/api";
import { useCart } from "../context/useCart";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToCart } = useCart();

  // Constants
  const SPECIAL_GROUP_IDS = [4, 6, 7, 11];
  const PERMANENTLY_EXCLUDED_IDS = [12];
  const currentIdNum = useMemo(() => Number(id), [id]);
  
  const isExcludedProduct = PERMANENTLY_EXCLUDED_IDS.includes(currentIdNum);
  const isSpecialProduct = SPECIAL_GROUP_IDS.includes(currentIdNum);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiGet(`pricing/products/`);
        if (res?.data) {
          setAllProducts(res.data);
          
          const foundProduct = res.data.find((p) => p.id === currentIdNum);
          if (foundProduct) {
            setProduct(foundProduct);
            setPrice(foundProduct.price?.toString() ?? "");
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
    loadProducts();
  }, [id, navigate, currentIdNum]);

  const getIdsToUpdate = () => {
    // If product is excluded, return empty array
    if (isExcludedProduct) {
      return [];
    }
    
    // If product is special, return all special group IDs (excluding excluded ones)
    if (isSpecialProduct) {
      return SPECIAL_GROUP_IDS.filter(id => !PERMANENTLY_EXCLUDED_IDS.includes(id));
    }
    
    // For regular products, get all IDs except special and excluded ones
    return allProducts
      .map(p => p.id)
      .filter(productId => 
        !SPECIAL_GROUP_IDS.includes(productId) && 
        !PERMANENTLY_EXCLUDED_IDS.includes(productId)
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate price
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }
    
    // Check if product is excluded
    if (isExcludedProduct) {
      alert("Price cannot be changed for this product");
      return;
    }

    setSaving(true);

    try {
      const idsToUpdate = getIdsToUpdate();
      
      if (idsToUpdate.length === 0) {
        alert("No products to update");
        return;
      }

      await updateProductPrices(idsToUpdate, priceNum);
      alert("Price updated successfully!");
      navigate("/pos");
    } catch (err) {
      console.error("Failed to update price", err);
      alert("Failed to update price.");
    } finally {
      setSaving(false);
    }
  };

  const updateProductPrices = async (productIds, newPrice) => {
    const updatePromises = productIds.map(productId =>
      apiPatch(`pricing/products/${productId}/update-price/`, {
        price: newPrice,
      })
    );
    return Promise.all(updatePromises);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.product_name,
      price: Number(price) || 0,
    });
    navigate("/pos");
  };

  if (loading) return <div className="p-5">Loading product...</div>;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isExcludedProduct ? "View Product (Read-only)" : "Edit Product"}
      </h2>
      
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
            min="0.01"
            step="0.01"
            disabled={isExcludedProduct}
            className={`p-2 w-full rounded-md border ${isExcludedProduct ? 'bg-gray-100' : ''} border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {isExcludedProduct && (
            <p className="text-sm text-gray-500 mt-1">
              Price cannot be changed for this product
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || isExcludedProduct}
            className="py-2 px-3.5 rounded-md bg-indigo-500 text-white border-none font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={isExcludedProduct ? "Price cannot be changed for this product" : ""}
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
          
          {!isExcludedProduct && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-2 px-3.5 rounded-md bg-green-500 text-white border-none font-semibold ml-auto"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}