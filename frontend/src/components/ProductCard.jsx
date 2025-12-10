import React, { useState } from "react";
import { Plus, Edit } from "lucide-react";

export default function ProductCard({ product, onAdd, onEdit }) {
  const [imageError, setImageError] = useState(false);

  // Direct image URL - assuming images are in public/images folder with id.png format
  const imageUrl = `/images/${product.productId}.png`;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent triggering the main button click
    e.preventDefault();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <button
      onClick={onAdd}
      className="group relative bg-linear-to-br from-white/95 to-purple-50/95 rounded-2xl shadow-lg overflow-hidden border border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 w-full text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
    >
      {/* Edit Button - positioned absolutely */}
      <button
        onClick={handleEditClick}
        className="absolute top-2 left-2 z-10 p-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
        title="Edit Product"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>

      {/* Product Image */}
      <div className="h-36 bg-linear-to-br from-purple-100 to-pink-100 relative overflow-hidden">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl">🥩</div>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute top-2 right-2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Rs {product.price.toFixed(2)}/kg
        </div>

        {/* Add Icon Overlay (shown on hover) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 shadow-xl">
            <Plus className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10">
          {product.name}
        </h4>

        {/* Add text hint (replaces the Add button) */}
        <div className="flex items-center justify-center py-1">
          <span className="text-xs text-gray-600 font-medium">
            Click to add to cart
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
    </button>
  );
}
