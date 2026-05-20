import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../lib/cartEvents';
import './MiniCart.css';

const MiniCart = () => {
  const { items, totals } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const handler = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    };
    window.addEventListener('add-to-cart', handler);
    return () => window.removeEventListener('add-to-cart', handler);
  }, []);

  return (
    <a
      href="/checkout"
      className={`mini-cart ${pulse ? 'mini-cart-pulse' : ''}`}
      data-remote="remote-cart"
      aria-label="View cart"
    >
      <div className="mini-cart-count">{totals.itemCount}</div>
      <div className="mini-cart-copy">
        <span>Cart</span>
        <strong>{formatPrice(totals.subtotal)}</strong>
      </div>
      {items.length > 0 && (
        <span className="mini-cart-hint">
          {items.length} product{items.length !== 1 ? 's' : ''}
        </span>
      )}
    </a>
  );
};

export default MiniCart;
