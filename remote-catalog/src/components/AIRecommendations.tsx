import { Link } from 'react-router-dom';
import { getAIRecommendations } from '../lib/aiEngine';
import '../ai.css';

interface AIRecommendationsProps {
  seedId?: string;
  intent?: string;
  title?: string;
}

export default function AIRecommendations({
  seedId,
  intent = '',
  title = 'AI picks for you',
}: AIRecommendationsProps) {
  const { products, reason, scoreLabel } = getAIRecommendations({ seedId, intent });

  if (products.length === 0) return null;

  return (
    <section className="ai-panel" style={{ marginBottom: 24 }}>
      <div className="ai-panel-header">
        <h3>
          <span className="ai-badge">{title}</span>
        </h3>
        <span className="ai-confidence">{scoreLabel}</span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4338ca', textAlign: 'left' }}>{reason}</p>
      <div className="ai-rec-grid">
        {products.map((p, i) => (
          <Link key={p.id} to={`/products/${p.id}`} className="ai-rec-card">
            <img src={p.image} alt="" loading="lazy" />
            <h4>{p.name}</h4>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${p.price}</span>
            <span className="ai-rec-score">Match {96 - i * 4}%</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
