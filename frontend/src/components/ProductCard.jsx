import React, { useState } from "react";
import { Plus, Edit } from "lucide-react";

export default function ProductCard({ product, onAdd, onEdit }) {
  const [imageError, setImageError] = useState(false);

  // Direct image URL - assuming images are in public/images folder with id.png format
  const imageUrl = `/images/${product.productId}.png`;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/95 to-purple-50/95 rounded-2xl shadow-lg overflow-hidden border border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      {/* Product Image */}
      <div className="h-36 bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
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
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Rs {product.price.toFixed(2)}/kg
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10">
          {product.name}
        </h4>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
            title="Edit Product"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}
