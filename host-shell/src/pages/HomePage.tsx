import { Link } from 'react-router-dom';

const FEATURED = [
  { title: 'Apparel', desc: 'Jackets, hoodies & layers', to: '/products?cat=apparel', emoji: '🧥' },
  { title: 'Tech', desc: 'Watches, headphones & gear', to: '/products?cat=tech', emoji: '⌚' },
  { title: 'Footwear', desc: 'Runners built for speed', to: '/products?cat=footwear', emoji: '👟' },
];

const STATS = [
  { label: 'Products', value: '8+' },
  { label: 'Micro-frontends', value: '3' },
  { label: 'Free shipping', value: '$100+' },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">Module Federation · React 19</p>
        <h2>Enterprise Shop Hub</h2>
        <p className="home-lead">
          A distributed storefront where catalog and cart run as independent remotes,
          synchronized in real time via browser events and shared storage.
        </p>
        <div className="home-cta">
          <Link to="/products" className="home-btn primary">
            Browse Catalog
          </Link>
          <Link to="/checkout" className="home-btn secondary">
            View Cart
          </Link>
        </div>
      </section>

      <div className="home-stats">
        {STATS.map((s) => (
          <div key={s.label} className="home-stat">
            <span className="home-stat-value">{s.value}</span>
            <span className="home-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <section className="home-section">
        <h3>Shop by category</h3>
        <div className="home-cards">
          {FEATURED.map((f) => (
            <Link key={f.title} to={f.to} className="home-card">
              <span className="home-card-emoji">{f.emoji}</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
              <span className="home-card-link">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-arch">
        <h3>Architecture</h3>
        <div className="arch-diagram">
          <div className="arch-node host">host-shell :5000</div>
          <div className="arch-arrows">↓ federated imports ↓</div>
          <div className="arch-remotes">
            <div className="arch-node catalog">remote-catalog :5001</div>
            <div className="arch-node cart">remote-cart :5002</div>
          </div>
        </div>
        <p className="arch-note">
          Add items from the catalog remote — the cart remote listens via{' '}
          <code>add-to-cart</code> events and persists to <code>localStorage</code>.
        </p>
      </section>
    </div>
  );
}
