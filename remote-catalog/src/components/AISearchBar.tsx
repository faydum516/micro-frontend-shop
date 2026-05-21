import { useState } from 'react';
import {
  parseNaturalLanguageSearch,
  dispatchAISearch,
  getQuickPrompts,
  type AISearchIntent,
} from '../lib/aiEngine';
import '../ai.css';

interface AISearchBarProps {
  onSearch?: (intent: AISearchIntent) => void;
}

export default function AISearchBar({ onSearch }: AISearchBarProps) {
  const [input, setInput] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const intent = parseNaturalLanguageSearch(query);
    setInterpretation(intent.interpretation);
    setConfidence(intent.confidence);
    dispatchAISearch(intent);
    onSearch?.(intent);
    setLoading(false);
  };

  return (
    <div className="ai-panel ai-search-bar">
      <div className="ai-panel-header">
        <h3>
          <span className="ai-badge">AI Search</span>
        </h3>
        <span className="ai-powered-tag">Natural language</span>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#5d6b82', textAlign: 'left' }}>
        Describe what you want — e.g. &quot;waterproof jacket under $150&quot;
      </p>
      <div className="ai-search-input-wrap">
        <input
          className="ai-search-input"
          type="search"
          placeholder="Ask AI to find products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(input)}
        />
        <button
          type="button"
          className="ai-search-btn"
          disabled={loading}
          onClick={() => runSearch(input)}
        >
          {loading ? 'Thinking…' : 'Search'}
        </button>
      </div>
      {interpretation && (
        <div className="ai-interpretation">
          {interpretation}
          {confidence != null && (
            <span className="ai-confidence" style={{ display: 'block', marginTop: 6 }}>
              Confidence: {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      )}
      <div className="ai-prompt-chips">
        {getQuickPrompts().slice(0, 3).map((p) => (
          <button key={p} type="button" className="ai-prompt-chip" onClick={() => { setInput(p); runSearch(p); }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
