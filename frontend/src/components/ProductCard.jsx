import React from "react";
import PropTypes from "prop-types";
import { Edit3, Sparkles } from "lucide-react";

function ProductCard({ product, onAdd, onEdit }) {
  const p = product || {
    id: "dummy-1",
    name: "Fresh Chicken (1kg)",
    price: 320.0,
    image: "https://via.placeholder.com/320x200.png?text=Chicken+Image",
  };

  const handleCardClick = (e) => {
    if (!e.target.closest('button[aria-label="Edit product"]')) {
      onAdd && onAdd(p);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit && onEdit(p);
  };

  return (
    <article 
      className="group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-purple-100 relative cursor-pointer" 
      aria-label={`Product ${p.name}`}
      onClick={handleCardClick}
    >
      

      <div className="relative w-full h-20 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
        <img 
          src={p.image} 
          alt={p.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-2">
        <h3 className="text-xs font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2rem]">
          {p.name}
        </h3>
        
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500">Price</span>
            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Rs {p.price.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={handleEditClick}
            className="p-1 rounded border border-purple-200 bg-white text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            type="button"
            aria-label="Edit product"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    image: PropTypes.string,
  }),
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
};

ProductCard.defaultProps = {
  product: null,
};

export default ProductCard;