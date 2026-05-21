import {
  PRODUCTS,
  getProductById,
  type Product,
  type Category,
} from '../data/products';

export interface AISearchIntent {
  query: string;
  category: Category | 'all';
  maxPrice: number;
  minPrice: number;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';
  keywords: string[];
  interpretation: string;
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type AssistantAction =
  | { type: 'reply'; message: string; suggestions?: string[] }
  | { type: 'search'; intent: AISearchIntent }
  | { type: 'navigate'; path: string }
  | { type: 'addToCart'; product: Pick<Product, 'id' | 'name' | 'price' | 'image'> };

const CATEGORY_ALIASES: Record<string, Category> = {
  apparel: 'apparel',
  clothing: 'apparel',
  jacket: 'apparel',
  hoodie: 'apparel',
  wear: 'apparel',
  bags: 'bags',
  backpack: 'bags',
  pack: 'bags',
  tech: 'tech',
  technology: 'tech',
  watch: 'tech',
  headphones: 'tech',
  audio: 'tech',
  footwear: 'footwear',
  shoes: 'footwear',
  sneakers: 'footwear',
  runners: 'footwear',
  accessories: 'accessories',
  sunglasses: 'accessories',
  bottle: 'accessories',
};

const QUICK_PROMPTS = [
  'Waterproof jacket under $150',
  'Best rated tech gifts',
  'Commute essentials',
  'What should I add to reach free shipping?',
];

export function getQuickPrompts() {
  return QUICK_PROMPTS;
}

export function parseNaturalLanguageSearch(input: string): AISearchIntent {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  let maxPrice = 300;
  let minPrice = 0;
  let category: Category | 'all' = 'all';
  let sort: AISearchIntent['sort'] = 'featured';

  const underMatch = lower.match(/(?:under|below|less than|max|budget)\s*\$?\s*(\d+)/);
  if (underMatch) maxPrice = Number(underMatch[1]);

  const overMatch = lower.match(/(?:over|above|more than|min)\s*\$?\s*(\d+)/);
  if (overMatch) minPrice = Number(overMatch[1]);

  for (const [alias, cat] of Object.entries(CATEGORY_ALIASES)) {
    if (lower.includes(alias)) {
      category = cat;
      break;
    }
  }

  if (/best rated|top rated|highest rated/.test(lower)) sort = 'rating';
  if (/cheapest|lowest price|affordable/.test(lower)) sort = 'price-asc';
  if (/expensive|premium|high end/.test(lower)) sort = 'price-desc';

  const stopWords = new Set([
    'a', 'an', 'the', 'for', 'me', 'my', 'find', 'show', 'get', 'need', 'want',
    'under', 'below', 'over', 'best', 'rated', 'cheap', 'some', 'any',
  ]);
  const keywords = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));

  const parts: string[] = [];
  if (category !== 'all') parts.push(`category: ${category}`);
  if (maxPrice < 300) parts.push(`max $${maxPrice}`);
  if (minPrice > 0) parts.push(`min $${minPrice}`);
  if (sort !== 'featured') parts.push(`sorted by ${sort.replace('-', ' ')}`);
  if (keywords.length) parts.push(`keywords: ${keywords.join(', ')}`);

  const interpretation =
    parts.length > 0
      ? `AI interpreted: ${parts.join(' · ')}`
      : `Searching catalog for "${raw}"`;

  return {
    query: raw,
    category,
    maxPrice,
    minPrice,
    sort,
    keywords,
    interpretation,
    confidence: parts.length >= 2 ? 0.92 : parts.length === 1 ? 0.78 : 0.55,
  };
}

export function applyAISearch(products: Product[], intent: AISearchIntent): Product[] {
  let list = [...products];
  if (intent.category !== 'all') list = list.filter((p) => p.category === intent.category);
  list = list.filter((p) => p.price <= intent.maxPrice && p.price >= intent.minPrice);

  const terms = [...intent.keywords, ...intent.query.toLowerCase().split(/\s+/)].filter(
    (t) => t.length > 2,
  );

  if (terms.length) {
    list = list.filter((p) => {
      const blob = `${p.name} ${p.description} ${p.category} ${p.badge} ${p.features.join(' ')}`.toLowerCase();
      return terms.some((t) => blob.includes(t));
    });
  }

  switch (intent.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return list;
}

export function getAIRecommendations(context: {
  seedId?: string;
  intent?: string;
  limit?: number;
}): { products: Product[]; reason: string; scoreLabel: string } {
  const limit = context.limit ?? 4;
  const intent = (context.intent ?? '').toLowerCase();

  if (context.seedId) {
    const seed = getProductById(context.seedId);
    if (seed) {
      const related = PRODUCTS.filter(
        (p) => p.id !== seed.id && (p.category === seed.category || p.price < seed.price * 1.3),
      )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
      return {
        products: related,
        reason: `Based on your interest in ${seed.name}, shoppers also viewed these.`,
        scoreLabel: 'Collaborative match',
      };
    }
  }

  if (/gift|present/.test(intent)) {
    const gifts = [...PRODUCTS]
      .filter((p) => p.rating >= 4.5 && p.price >= 60 && p.price <= 220)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit);
    return {
      products: gifts,
      reason: 'AI picked high-satisfaction items in a popular gift price range.',
      scoreLabel: 'Gift intent',
    };
  }

  if (/commute|work|office|daily/.test(intent)) {
    const commute = PRODUCTS.filter((p) =>
      ['jacket', 'pack', 'watch', 'headphones'].includes(p.id),
    ).slice(0, limit);
    return {
      products: commute,
      reason: 'Optimized for daily commute: weather layer, carry, and connectivity.',
      scoreLabel: 'Lifestyle model',
    };
  }

  const trending = [...PRODUCTS]
    .sort((a, b) => b.rating * Math.log(b.reviewCount + 1) - a.rating * Math.log(a.reviewCount + 1))
    .slice(0, limit);

  return {
    products: trending,
    reason: 'Trending picks from ratings velocity and review volume.',
    scoreLabel: 'Trending score',
  };
}

export function answerProductQuestion(product: Product, question: string): string {
  const q = question.toLowerCase();

  if (/water|rain|weather|proof/.test(q)) {
    return product.features.some((f) => /water|dwr|resist/i.test(f))
      ? `Yes — ${product.name} includes weather protection: ${product.features.find((f) => /water|dwr|resist/i.test(f))}.`
      : `${product.name} isn't primarily weather-sealed; it's best for ${product.category === 'tech' ? 'daily tech use' : 'casual wear'}.`;
  }

  if (/battery|charge|power/.test(q)) {
    const feat = product.features.find((f) => /battery|charge|hour/i.test(f));
    return feat
      ? `Power specs: ${feat}.`
      : 'This item doesn\'t have a rechargeable battery — it\'s a physical product.';
  }

  if (/size|fit/.test(q)) {
    return product.sizes
      ? `Available sizes: ${product.sizes.join(', ')}. True to size per ${product.reviewCount} reviews.`
      : 'One-size / standard fit. Check dimensions in the feature list.';
  }

  if (/warranty|return/.test(q)) {
    return product.category === 'bags'
      ? 'Includes lifetime warranty on manufacturing defects. 30-day returns.'
      : '30-day hassle-free returns. 1-year limited warranty.';
  }

  if (/stock|available/.test(q)) {
    return product.stock <= 5
      ? `Low stock — only ${product.stock} left. AI suggests ordering soon.`
      : `${product.stock} units in stock. Ships within 2 business days.`;
  }

  if (/worth|compare|why/.test(q)) {
    return `At $${product.price}, ${product.name} scores ${product.rating}/5 from ${product.reviewCount} reviews. Standout: ${product.features[0]}.`;
  }

  return `About ${product.name}: ${product.description} Key features: ${product.features.slice(0, 2).join('; ')}.`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function chatWithAssistant(
  message: string,
  _history: ChatMessage[],
): Promise<AssistantAction[]> {
  const apiUrl = import.meta.env.VITE_AI_API_URL as string | undefined;
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, products: PRODUCTS.map((p) => ({ id: p.id, name: p.name, price: p.price })) }),
      });
      if (res.ok) {
        const data = (await res.json()) as { actions?: AssistantAction[]; message?: string };
        if (data.actions?.length) return data.actions;
        if (data.message) return [{ type: 'reply', message: data.message }];
      }
    } catch {
      /* fall through to local engine */
    }
  }

  await delay(400 + Math.random() * 400);

  const lower = message.toLowerCase().trim();

  if (/^(hi|hello|hey|help)/.test(lower)) {
    return [
      {
        type: 'reply',
        message:
          "I'm Nexus AI — your shopping copilot. I can search in plain English, recommend products, and add items to your cart. Try a prompt below.",
        suggestions: getQuickPrompts(),
      },
    ];
  }

  if (/free shipping|shipping/.test(lower)) {
    return [
      {
        type: 'reply',
        message:
          'Free shipping kicks in at $100. Add a mid-tier accessory or bottle to optimize your cart — I can show affordable add-ons.',
      },
      {
        type: 'search',
        intent: parseNaturalLanguageSearch('accessories under $40'),
      },
    ];
  }

  if (/add (.+) to cart|put (.+) in cart/.test(lower)) {
    const match = PRODUCTS.find((p) => lower.includes(p.name.toLowerCase()) || lower.includes(p.id));
    if (match) {
      return [
        { type: 'reply', message: `Adding ${match.name} to your cart.` },
        {
          type: 'addToCart',
          product: { id: match.id, name: match.name, price: match.price, image: match.image },
        },
      ];
    }
  }

  if (/go to cart|checkout|my cart/.test(lower)) {
    return [
      { type: 'reply', message: 'Opening your cart.' },
      { type: 'navigate', path: '/checkout' },
    ];
  }

  if (/show|open|view/.test(lower) && /jacket|product/.test(lower)) {
    const jacket = getProductById('jacket');
    if (jacket) {
      return [
        { type: 'reply', message: `Here's ${jacket.name} — ${jacket.rating}★ from ${jacket.reviewCount} reviews.` },
        { type: 'navigate', path: `/products/${jacket.id}` },
      ];
    }
  }

  if (/recommend|suggest|gift|commute|best/.test(lower)) {
    const rec = getAIRecommendations({ intent: lower });
    const names = rec.products.map((p) => p.name).join(', ');
    return [
      {
        type: 'reply',
        message: `${rec.reason} Top picks: ${names}.`,
        suggestions: rec.products.map((p) => `Tell me about ${p.name}`),
      },
      { type: 'search', intent: parseNaturalLanguageSearch(message) },
    ];
  }

  const intent = parseNaturalLanguageSearch(message);
  const results = applyAISearch(PRODUCTS, intent);

  return [
    {
      type: 'reply',
      message:
        results.length > 0
          ? `${intent.interpretation} Found ${results.length} match${results.length === 1 ? '' : 'es'}.`
          : `No exact matches. ${intent.interpretation} Try broadening your budget or category.`,
      suggestions: results.slice(0, 3).map((p) => `Add ${p.name} to cart`),
    },
    { type: 'search', intent },
  ];
}

export function dispatchAISearch(intent: AISearchIntent) {
  window.dispatchEvent(new CustomEvent('ai-search', { detail: intent }));
}
