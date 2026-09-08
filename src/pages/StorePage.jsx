import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBanner } from '../hooks/useBanner';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../api';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export default function StorePage() {
  const { user, authFetch, logout } = useAuth();
  const { banner, showBanner } = useBanner();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(loadCart);
  const [orders, setOrders] = useState(null); // null = not loaded yet
  const [placing, setPlacing] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      // Public endpoint — no token needed, plain fetch is fine here.
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

  function addToCart(product, quantity) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      const next = existing
        ? prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [
            ...prev,
            { productId: product.id, name: product.name, price: Number(product.price), quantity },
          ];
      saveCart(next);
      return next;
    });
  }

  function removeFromCart(productId) {
    setCart((prev) => {
      const next = prev.filter((item) => item.productId !== productId);
      saveCart(next);
      return next;
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function placeOrder() {
    setPlacing(true);
    try {
      const res = await authFetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Order failed');

      showBanner(`Order #${body.data} placed successfully.`, 'success');
      setCart([]);
      saveCart([]);
      await loadProducts(); // refresh stock levels
    } catch (err) {
      showBanner(err.message, 'error');
    } finally {
      setPlacing(false);
    }
  }

  async function loadOrders() {
    try {
      const res = await authFetch(`/users/${user.id}/orders`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to load orders');

      const grouped = new Map();
      for (const row of body.data) {
        if (!grouped.has(row.order_id)) {
          grouped.set(row.order_id, { status: row.status, items: [] });
        }
        grouped.get(row.order_id).items.push(row);
      }
      setOrders(Array.from(grouped.entries()));
    } catch (err) {
      showBanner(err.message, 'error');
    }
  }

  return (
    <>
      <header className="topbar">
        <h1>Corner Store</h1>
        <div className="customer-picker">
          <Link to="/products/manage">Manage products</Link>
          <span>{user?.email}</span>
          <button type="button" className="ghost-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <Banner banner={banner} />

      <div className="layout">
        <section>
          <div className="section-head">
            <h2>Products</h2>
            <button type="button" className="ghost-btn" onClick={loadProducts}>
              Refresh
            </button>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <aside className="cart">
          <h2>Cart</h2>
          <div className="cart-items">
            {cart.length === 0 && <p className="cart-empty">Your cart is empty.</p>}
            {cart.map((item) => (
              <div className="cart-item" key={item.productId}>
                <span className="meta">
                  {item.name} <span className="qty">x{item.quantity}</span>
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button type="button" aria-label="Remove" onClick={() => removeFromCart(item.productId)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="primary-btn"
            disabled={cart.length === 0 || placing}
            onClick={placeOrder}
          >
            Place order
          </button>

          <div className="order-history">
            <div className="section-head">
              <h2>Order history</h2>
              <button type="button" className="ghost-btn" onClick={loadOrders}>
                Load
              </button>
            </div>
            {orders === null && <p className="cart-empty">Not loaded yet.</p>}
            {orders !== null && orders.length === 0 && <p className="cart-empty">No orders yet.</p>}
            {orders?.map(([orderId, order]) => (
              <div className="order-card" key={orderId}>
                <div className="order-head">
                  <span>Order #{orderId}</span>
                  <span>{order.status}</span>
                </div>
                {order.items.map((item, idx) => (
                  <div className="order-line" key={`${orderId}-${idx}`}>
                    <span>
                      {item.product_name} x{item.quantity}
                    </span>
                    <span>${(item.quantity * Number(item.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
