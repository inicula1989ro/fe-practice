import { useState } from 'react';

export default function ProductCard({ product, onAdd }) {
  const stock = Number(product.stock);
  const lowStock = stock > 0 && stock <= 5;
  const outOfStock = stock <= 0;
  const [qty, setQty] = useState(1);

  return (
    <div className="product-card">
      <span className="category">{product.category}</span>
      <span className="name">{product.name}</span>
      <span className="price">${Number(product.price).toFixed(2)}</span>
      <span className={`stock ${lowStock || outOfStock ? 'low' : ''}`}>
        {outOfStock ? 'Out of stock' : `${stock} in stock`}
      </span>
      <div className="add-row">
        <input
          type="number"
          min="1"
          max={stock}
          value={qty}
          disabled={outOfStock}
          onChange={(e) => setQty(Number(e.target.value) || 1)}
        />
        <button
          type="button"
          className="add-btn"
          disabled={outOfStock}
          onClick={() => onAdd(product, Math.max(1, Math.min(stock, qty)))}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
