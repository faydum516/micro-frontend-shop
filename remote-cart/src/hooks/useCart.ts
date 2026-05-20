import { useState, useEffect, useCallback } from 'react';
import {
  type CartItem,
  loadCart,
  saveCart,
  cartTotals,
} from '../lib/cartEvents';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  }, []);

  useEffect(() => {
    const onAdd = (e: Event) => {
      const product = (e as CustomEvent).detail as {
        id: string;
        name: string;
        price: number;
        image?: string;
      };
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        } else {
          next = [...prev, { ...product, quantity: 1 }];
        }
        saveCart(next);
        return next;
      });
    };

    const onSync = (e: Event) => {
      const cart = (e as CustomEvent).detail as CartItem[];
      setItems(cart);
    };

    window.addEventListener('add-to-cart', onAdd);
    window.addEventListener('cart-updated', onSync);
    return () => {
      window.removeEventListener('add-to-cart', onAdd);
      window.removeEventListener('cart-updated', onSync);
    };
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) {
        persist(items.filter((i) => i.id !== id));
        return;
      }
      persist(items.map((i) => (i.id === id ? { ...i, quantity } : i)));
    },
    [items, persist],
  );

  const removeItem = useCallback(
    (id: string) => persist(items.filter((i) => i.id !== id)),
    [items, persist],
  );

  const clearCart = useCallback(() => persist([]), [persist]);

  return {
    items,
    totals: cartTotals(items),
    updateQuantity,
    removeItem,
    clearCart,
  };
}
