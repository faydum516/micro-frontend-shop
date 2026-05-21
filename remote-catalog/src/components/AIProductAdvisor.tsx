import { useState } from 'react';
import type { Product } from '../data/products';
import { answerProductQuestion } from '../lib/aiEngine';
import '../ai.css';

const STARTER_QUESTIONS = [
  'Is it waterproof?',
  'What sizes are available?',
  'Is it worth the price?',
  'How\'s the stock?',
];

interface AIProductAdvisorProps {
  product: Product;
}

export default function AIProductAdvisor({ product }: AIProductAdvisorProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `I know everything about ${product.name}. Ask me about fit, features, or whether it's right for you.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setTyping(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
    const answer = answerProductQuestion(product, question);
    setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    setTyping(false);
  };

  return (
    <div className="ai-panel ai-advisor">
      <div className="ai-panel-header">
        <h3>
          <span className="ai-badge">Product AI</span>
        </h3>
      </div>
      <div className="ai-advisor-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {typing && (
          <div className="ai-typing">
            <span /><span /><span />
          </div>
        )}
      </div>
      <div className="ai-prompt-chips" style={{ marginBottom: 12 }}>
        {STARTER_QUESTIONS.map((q) => (
          <button key={q} type="button" className="ai-prompt-chip" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="ai-advisor-input">
        <input
          placeholder="Ask about this product..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(input)}
        />
        <button type="button" onClick={() => ask(input)}>
          Ask
        </button>
      </div>
    </div>
  );
}
