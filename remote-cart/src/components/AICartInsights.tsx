import { useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../lib/cartEvents';

export default function AICartInsights() {
  const { items, totals } = useCart();

  const insight = useMemo(() => {
    if (items.length === 0) {
      return {
        title: 'AI cart coach',
        message: 'Your cart is empty. Ask Nexus AI for gift ideas or say "commute essentials" in the assistant.',
        action: 'Browse catalog with AI search',
        href: '/products',
      };
    }

    const subtotal = totals.subtotal;
    const toFreeShip = Math.max(0, 100 - subtotal);

    if (toFreeShip > 0 && toFreeShip <= 40) {
      return {
        title: 'Almost free shipping',
        message: `Add ${formatPrice(toFreeShip)} more to unlock free shipping. AI suggests the Insulated Trail Bottle ($34) or Polarized Aviators ($68).`,
        action: 'Find add-ons',
        href: '/products?q=accessories under 70',
      };
    }

    if (toFreeShip === 0) {
      return {
        title: 'Shipping optimized',
        message: 'You qualify for free shipping. Promo SAVE10 still applies at checkout for an extra 10% off.',
        action: null,
        href: null,
      };
    }

    const highQty = items.find((i) => i.quantity >= 2);
    if (highQty) {
      return {
        title: 'Bulk insight',
        message: `You're buying ${highQty.quantity}× ${highQty.name}. Consider one premium upgrade — AI rates the Studio ANC Headphones 4.9★ for daily use.`,
        action: 'View headphones',
        href: '/products/headphones',
      };
    }

    return {
      title: 'Smart checkout',
      message: `${items.length} item${items.length > 1 ? 's' : ''} · ${formatPrice(subtotal)} subtotal. Estimated total with tax: ${formatPrice(totals.total)}.`,
      action: 'Apply SAVE10 at checkout',
      href: null,
    };
  }, [items, totals]);

  return (
    <div className="ai-cart-insight">
      <span className="ai-cart-insight-badge">✦ AI Insight</span>
      <h4>{insight.title}</h4>
      <p>{insight.message}</p>
      {insight.action && insight.href && (
        <a href={insight.href} className="ai-cart-insight-link">
          {insight.action} →
        </a>
      )}
    </div>
  );
}
