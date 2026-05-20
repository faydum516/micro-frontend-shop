import { useState } from 'react';
import type { FormEvent } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { formatPrice } from './lib/cartEvents';
import './cart.css';

function QtyControl({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="qty-control">
      <button type="button" onClick={() => onChange(quantity - 1)}>
        −
      </button>
      <span>{quantity}</span>
      <button type="button" onClick={() => onChange(quantity + 1)}>
        +
      </button>
    </div>
  );
}

export function CartPage() {
  const { items, totals, updateQuantity, removeItem } = useCart();
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const discount = promoApplied ? totals.subtotal * 0.1 : 0;
  const finalTotal = totals.total - discount;

  const applyPromo = () => {
    if (promo.toUpperCase() === 'SAVE10') setPromoApplied(true);
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
          <h2>Your cart is empty</h2>
          <p style={{ color: '#5d6b82', marginBottom: 20 }}>
            Browse our catalog and add items — they sync across micro-frontends instantly.
          </p>
          <Link to="/products" className="btn-checkout" style={{ display: 'inline-block', width: 'auto' }}>
            Shop Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 800, color: '#18202f', textAlign: 'left' }}>
        Your Cart ({totals.itemCount} items)
      </h2>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article key={item.id} className="cart-item">
              {item.image ? (
                <img className="cart-item-image" src={item.image} alt="" />
              ) : (
                <div className="cart-item-image" />
              )}
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="unit-price">{formatPrice(item.price)} each</p>
                <QtyControl
                  quantity={item.quantity}
                  onChange={(q) => updateQuantity(item.id, q)}
                />
              </div>
              <div className="cart-item-actions">
                <span className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </span>
                <button type="button" className="cart-remove" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className={totals.shipping === 0 ? 'free-shipping' : ''}>
              {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
            </span>
          </div>
          <div className="summary-row">
            <span>Estimated tax</span>
            <span>{formatPrice(totals.tax)}</span>
          </div>
          {promoApplied && (
            <div className="summary-row">
              <span>Promo SAVE10</span>
              <span style={{ color: '#1f7a4d' }}>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="promo-input">
            <input
              type="text"
              placeholder="Promo code"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
            <button type="button" onClick={applyPromo}>
              Apply
            </button>
          </div>
          {promoApplied && <div className="promo-applied">✓ 10% discount applied</div>}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
          <Link to="/checkout/payment" className="btn-checkout">
            Proceed to Checkout →
          </Link>
        </aside>
      </div>
    </div>
  );
}

type FormErrors = Record<string, string>;

export function CheckoutForm() {
  const navigate = useNavigate();
  const { items, totals, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.zip.trim()) e.zip = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (paymentMethod === 'paypal') return true;
    const e: FormErrors = {};
    if (form.cardNumber.replace(/\s/g, '').length < 15) e.cardNumber = 'Invalid card';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Use MM/YY';
    if (form.cvc.length < 3) e.cvc = 'Invalid CVC';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }
    if (!validateStep2()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);
    clearCart();
    setSubmitting(false);
    setStep(3);
  };

  if (items.length === 0 && !orderId) {
    return (
      <div className="checkout-page">
        <p>Nothing to checkout.</p>
        <Link to="/products">← Continue shopping</Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <h2>Order confirmed!</h2>
          <p>Thank you for your purchase.</p>
          <p className="order-id">Order ID: {orderId}</p>
          <Link
            to="/products"
            className="btn-checkout"
            style={{ display: 'inline-block', marginTop: 24, width: 'auto' }}
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
          1. Shipping
        </div>
        <div className={`checkout-step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>
          2. Payment
        </div>
        <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>3. Done</div>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-section">
            <h3>Shipping details</h3>
            <div className="form-grid">
              <div className={`form-field full ${errors.email ? 'error' : ''}`}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className={`form-field ${errors.firstName ? 'error' : ''}`}>
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                />
              </div>
              <div className={`form-field ${errors.lastName ? 'error' : ''}`}>
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                />
              </div>
              <div className={`form-field full ${errors.address ? 'error' : ''}`}>
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="state">State</label>
                <select id="state" value={form.state} onChange={(e) => update('state', e.target.value)}>
                  <option value="">Select</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="WA">Washington</option>
                </select>
              </div>
              <div className={`form-field ${errors.zip ? 'error' : ''}`}>
                <label htmlFor="zip">ZIP</label>
                <input id="zip" value={form.zip} onChange={(e) => update('zip', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h3>Payment — {formatPrice(totals.total)}</h3>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Card
              </button>
              <button
                type="button"
                className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                PayPal
              </button>
            </div>
            {paymentMethod === 'card' && (
              <div className="form-grid">
                <div className={`form-field full ${errors.cardNumber ? 'error' : ''}`}>
                  <label htmlFor="card">Card number</label>
                  <input
                    id="card"
                    placeholder="4242 4242 4242 4242"
                    value={form.cardNumber}
                    onChange={(e) => update('cardNumber', e.target.value)}
                  />
                </div>
                <div className={`form-field ${errors.expiry ? 'error' : ''}`}>
                  <label htmlFor="expiry">Expiry</label>
                  <input
                    id="expiry"
                    placeholder="MM/YY"
                    value={form.expiry}
                    onChange={(e) => update('expiry', e.target.value)}
                  />
                </div>
                <div className={`form-field ${errors.cvc ? 'error' : ''}`}>
                  <label htmlFor="cvc">CVC</label>
                  <input
                    id="cvc"
                    value={form.cvc}
                    onChange={(e) => update('cvc', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {step === 2 && (
            <button
              type="button"
              style={{
                padding: '14px 24px',
                border: '1px solid #d7dfeb',
                borderRadius: 8,
                background: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          )}
          <button
            type="submit"
            className="btn-checkout"
            style={{ flex: 1 }}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : step === 1 ? 'Continue to Payment' : `Pay ${formatPrice(totals.total)}`}
          </button>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
          <Link to="/checkout" onClick={(e) => { e.preventDefault(); navigate('/checkout'); }}>
            ← Return to cart
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function CartRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CartPage />} />
      <Route path="payment" element={<CheckoutForm />} />
    </Routes>
  );
}
