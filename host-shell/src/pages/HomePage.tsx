import { Link } from 'react-router-dom';

const FEATURED = [
  { title: 'Apparel', desc: 'Jackets, hoodies & layers', to: '/products?cat=apparel', emoji: '🧥' },
  { title: 'Tech', desc: 'Watches, headphones & gear', to: '/products?cat=tech', emoji: '⌚' },
  { title: 'Footwear', desc: 'Runners built for speed', to: '/products?cat=footwear', emoji: '👟' },
];

const AI_FEATURES = [
  {
    title: 'Natural language search',
    desc: 'Say "waterproof jacket under $150" — AI parses intent and filters the catalog.',
  },
  {
    title: 'Shopping copilot',
    desc: 'Floating Nexus AI assistant: search, navigate, add to cart via chat.',
  },
  {
    title: 'Product advisor',
    desc: 'Ask anything on a product page — fit, stock, warranty, worth it?',
  },
  {
    title: 'Smart cart insights',
    desc: 'AI nudges free shipping, promos, and bundle suggestions at checkout.',
  },
];

const STATS = [
  { label: 'AI features', value: '4' },
  { label: 'Micro-frontends', value: '3' },
  { label: 'Products', value: '8+' },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero home-hero-ai">
        <p className="home-eyebrow">✦ AI-Native Commerce</p>
        <h2>Nexus Commerce</h2>
        <p className="home-lead">
          An AI-driven micro-frontend shop — natural language discovery, intelligent
          recommendations, and a copilot that controls catalog and cart across remotes.
        </p>
        <div className="home-cta">
          <Link to="/products" className="home-btn primary">
            AI Catalog
          </Link>
          <button
            type="button"
            className="home-btn secondary home-btn-ai"
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
          >
            Open AI Copilot
          </button>
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

      <section className="home-section home-ai-section">
        <h3>AI-powered shopping</h3>
        <div className="home-ai-grid">
          {AI_FEATURES.map((f) => (
            <div key={f.title} className="home-ai-card">
              <span className="home-ai-card-badge">AI</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

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
        <h3>Plug in a real LLM</h3>
        <p className="arch-note">
          The local AI engine runs out of the box. Set{' '}
          <code>VITE_AI_API_URL</code> in <code>remote-catalog</code> to POST chat messages
          to your OpenAI-compatible endpoint and return structured actions.
        </p>
      </section>
    </div>
  );
}
