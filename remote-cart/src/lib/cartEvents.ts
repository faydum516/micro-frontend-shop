export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

const STORAGE_KEY = 'mfe-shop-cart';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
}

export function dispatchAddToCart(product: {
  id: string;
  name: string;
  price: number;
  image?: string;
}): void {
  window.dispatchEvent(new CustomEvent('add-to-cart', { detail: product }));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function cartTotals(items: CartItem[]) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 8.99;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;
  return { itemCount, subtotal, shipping, tax, total };
}
