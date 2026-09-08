import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBanner } from '../hooks/useBanner';
import Banner from '../components/Banner';
import { API_BASE_URL } from '../api';

const EMPTY_FORM = { name: '', category: '', price: '', stock: '' };

export default function ManageProductsPage() {
  const { authFetch } = useAuth();
  const { banner, showBanner } = useBanner();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to load products');
      setProducts(body.data);
    } catch (err) {
      showBanner(err.message, 'error');
    }
  }, [showBanner]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await authFetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to create product');

      showBanner(`"${body.data.name}" created successfully.`, 'success');
      setForm(EMPTY_FORM);
      await loadProducts();
    } catch (err) {
      showBanner(err.message, 'error');
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      category: product.category,
      price: Number(product.price),
      stock: product.stock,
    });
  }

  async function saveEdit(product) {
    try {
      const res = await authFetch(`/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category.trim(),
          price: Number(editForm.price),
          stock: Number(editForm.stock),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to update product');

      showBanner(`"${body.data.name}" updated.`, 'success');
      setEditingId(null);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? body.data : p)));
    } catch (err) {
      showBanner(err.message, 'error');
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;

    try {
      const res = await authFetch(`/products/${product.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json();
        throw new Error(body.error?.message || 'Failed to delete product');
      }
      showBanner(`"${product.name}" deleted.`, 'success');
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      // Most likely a 409 — the product has existing orders and the
      // database's ON DELETE RESTRICT constraint blocked the delete.
      showBanner(err.message, 'error');
    }
  }

  return (
    <div className="manage-section">
      <header className="topbar">
        <h1>Manage products</h1>
        <Link to="/">&larr; Back to store</Link>
      </header>

      <Banner banner={banner} />

      <form className="auth-form" onSubmit={handleCreate} style={{ margin: '1.5rem 0' }}>
        <label>
          Name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Category
          <input
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
        <label>
          Price
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            step="1"
            required
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </label>
        <button type="submit" className="primary-btn">
          Add product
        </button>
      </form>

      <div className="section-head">
        <h2>Existing products</h2>
        <button type="button" className="ghost-btn" onClick={loadProducts}>
          Refresh
        </button>
      </div>

      <div className="product-list">
        {products.length === 0 && <p className="cart-empty">No products yet.</p>}
        {products.map((product) =>
          editingId === product.id ? (
            <div className="product-row editing" key={product.id}>
              <input
                className="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="edit-category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
              <input
                className="edit-price"
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
              <input
                className="edit-stock"
                type="number"
                min="0"
                step="1"
                value={editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
              />
              <div className="actions">
                <button
                  type="button"
                  className="primary-btn"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
                  onClick={() => saveEdit(product)}
                >
                  Save
                </button>
                <button type="button" className="ghost-btn" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="product-row" key={product.id}>
              <div className="info">
                <span className="name">{product.name}</span>
                <span className="meta">
                  {product.category} · ${Number(product.price).toFixed(2)} · {product.stock} in stock
                </span>
              </div>
              <div className="actions">
                <button type="button" className="ghost-btn" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button type="button" className="danger-btn" onClick={() => deleteProduct(product)}>
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
