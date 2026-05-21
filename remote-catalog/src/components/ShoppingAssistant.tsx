import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  chatWithAssistant,
  dispatchAISearch,
  getQuickPrompts,
  type ChatMessage,
  type AssistantAction,
} from '../lib/aiEngine';
import '../ai.css';

export default function ShoppingAssistant() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Nexus AI. Search in plain English, get recommendations, or add items to your cart.',
      timestamp: Date.now(),
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(getQuickPrompts());
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener('open-ai-assistant', open);
    return () => window.removeEventListener('open-ai-assistant', open);
  }, []);

  const runActions = (actions: AssistantAction[]) => {
    for (const action of actions) {
      if (action.type === 'search') {
        dispatchAISearch(action.intent);
        if (!window.location.pathname.startsWith('/products')) {
          navigate('/products');
        }
      }
      if (action.type === 'navigate') navigate(action.path);
      if (action.type === 'addToCart') {
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: action.product }));
      }
      if (action.type === 'reply') {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: action.message, timestamp: Date.now() },
        ]);
        if (action.suggestions) setSuggestions(action.suggestions);
      }
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    setMessages((m) => [...m, { role: 'user', content: text, timestamp: Date.now() }]);
    setInput('');
    setTyping(true);
    const actions = await chatWithAssistant(text, messages);
    setTyping(false);
    runActions(actions);
  };

  return (
    <>
      <button
        type="button"
        className="ai-assistant-fab"
        aria-label="Open AI shopping assistant"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '✕' : '✦'}
      </button>

      {open && (
        <div className="ai-assistant-panel" role="dialog" aria-label="Nexus AI Assistant">
          <div className="ai-assistant-head">
            <h3>Nexus AI</h3>
            <p>Shopping copilot · Local engine (plug in API via VITE_AI_API_URL)</p>
          </div>
          <div className="ai-assistant-body" ref={bodyRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {typing && (
              <div className="ai-typing">
                <span /><span /><span />
              </div>
            )}
          </div>
          <div className="ai-assistant-foot">
            <div className="ai-suggestion-row">
              {suggestions.slice(0, 4).map((s) => (
                <button key={s} type="button" className="ai-suggestion-btn" onClick={() => send(s)}>
                  {s.length > 28 ? `${s.slice(0, 28)}…` : s}
                </button>
              ))}
            </div>
            <input
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
            />
          </div>
        </div>
      )}
    </>
  );
}
