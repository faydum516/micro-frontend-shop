import { useMemo, useState, useCallback, useEffect } from 'react';
import { Routes, Route, Link, useParams, useSearchParams } from 'react-router-dom';
import ProductGrid from './components/ProductGrid';
import AISearchBar from './components/AISearchBar';
import AIRecommendations from './components/AIRecommendations';
import AIProductAdvisor from './components/AIProductAdvisor';
import {
  PRODUCTS,
  CATEGORIES,
  getProductById,
  getRelatedProducts,
  type Product,
  type Category,
} from './data/products';
import { applyAISearch, type AISearchIntent } from './lib/aiEngine';
import './catalog.css';
import './ai.css';

function dispatchAddToCart(product: Pick<Product, 'id' | 'name' | 'price' | 'image'>) {
  window.dispatchEvent(
    new CustomEvent('add-to-cart', {
      detail: { id: product.id, name: product.name, price: product.price, image: product.image },
    }),
  );
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<Category | 'all'>(
    (searchParams.get('cat') as Category | 'all') || 'all',
  );
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'featured');
  const [maxPrice, setMaxPrice] = useState(300);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [aiIntent, setAiIntent] = useState<AISearchIntent | null>(null);

  useEffect(() => {
    const onAISearch = (e: Event) => {
      const intent = (e as CustomEvent<AISearchIntent>).detail;
      setAiIntent(intent);
      setSearch(intent.query);
      setCategory(intent.category);
      setMaxPrice(intent.maxPrice);
      setSort(intent.sort);
    };
    window.addEventListener('ai-search', onAISearch);
    return () => window.removeEventListener('ai-search', onAISearch);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category !== 'all') params.set('cat', category);
    if (sort !== 'featured') params.set('sort', sort);
    setSearchParams(params, { replace: true });
  }, [search, category, sort, setSearchParams]);

  const filtered = useMemo(() => {
    if (aiIntent) {
      return applyAISearch(PRODUCTS, { ...aiIntent, query: search, category, maxPrice, sort });
    }
    let list = [...PRODUCTS];
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.includes(q),
      );
    }
    list = list.filter((p) => p.price <= maxPrice);
    switch (sort) {
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
  }, [search, category, sort, maxPrice, aiIntent]);

  const handleAdd = useCallback((product: Product) => {
    dispatchAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }, []);

  return (
    <div className="catalog-page">
      <div className="catalog-hero">
        <span className="ai-badge" style={{ marginBottom: 12 }}>AI-Powered Catalog</span>
        <h2>Spring Collection 2026</h2>
        <p>Curated gear for work, trail, and everything between — ships free over $100.</p>
      </div>

      <AIRecommendations intent="trending" title="Trending now" />

      <div className="catalog-layout">
        <aside className="catalog-filters">
          <AISearchBar
            onSearch={(intent) => {
              setAiIntent(intent);
              setSearch(intent.query);
              setCategory(intent.category);
              setMaxPrice(intent.maxPrice);
              setSort(intent.sort);
            }}
          />
          <h3 style={{ marginTop: 20 }}>Filters</h3>
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder="Name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-chip ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label htmlFor="max-price">Max price: ${maxPrice}</label>
            <div className="price-range">
              <input
                id="max-price"
                type="range"
                min={20}
                max={300}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="filter-group">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </aside>

        <section>
          <div className="catalog-toolbar">
            <p className="result-count">
              Showing <strong>{filtered.length}</strong> of {PRODUCTS.length} products
              {aiIntent && (
                <span className="ai-confidence" style={{ display: 'block', marginTop: 6 }}>
                  {aiIntent.interpretation}
                </span>
              )}
            </p>
          </div>
          <ProductGrid products={filtered} onAddToCart={handleAdd} addedId={addedId} />
        </section>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id ?? '');
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] ?? '');
      setSelectedSize(product.sizes?.[0] ?? '');
      setImageIndex(0);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="detail-page">
        <div className="empty-state">
          <h2>Product not found</h2>
          <p>SKU "{id}" does not exist in our catalog.</p>
          <Link to="/products">← Back to catalog</Link>
        </div>
      </div>
    );
  }

  const related = getRelatedProducts(product);
  const stockClass = product.stock <= 5 ? 'low' : 'in-stock';

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      dispatchAddToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="detail-page">
      <nav className="detail-breadcrumb">
        <Link to="/products">Catalog</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-gallery">
          <img
            className="detail-gallery-main"
            src={product.images[imageIndex] ?? product.image}
            alt={product.name}
          />
          {product.images.length > 1 && (
            <div className="detail-thumbs">
              {product.images.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className={`detail-thumb ${i === imageIndex ? 'active' : ''}`}
                  onClick={() => setImageIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <span className="product-badge">{product.badge}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
            <span>
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>
          <div className="detail-price">
            <span className="current">${product.price}</span>
            {product.originalPrice && (
              <span className="original">${product.originalPrice}</span>
            )}
          </div>
          <span className={`detail-stock ${stockClass}`}>
            {product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
          </span>
          <p style={{ textAlign: 'left', color: '#40506a', lineHeight: 1.6, marginBottom: 24 }}>
            {product.description}
          </p>

          <div className="detail-options">
            <div className="option-row">
              <span>Color — {selectedColor}</span>
              <div className="option-pills">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`option-pill ${selectedColor === c ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {product.sizes && (
              <div className="option-row">
                <span>Size — {selectedSize}</span>
                <div className="option-pills">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`option-pill ${selectedSize === s ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <div className="qty-control">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={`btn-primary ${added ? 'added' : ''}`}
              onClick={handleAdd}
            >
              {added ? '✓ Added to Cart' : `Add ${quantity} to Cart`}
            </button>
          </div>

          <div className="detail-features">
            <h3>Highlights</h3>
            <ul>
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <AIProductAdvisor product={product} />
        </div>
      </div>

      <AIRecommendations seedId={product.id} title="AI also recommends" />

      {related.length > 0 && (
        <section className="related-section">
          <h3>You may also like</h3>
          <ProductGrid
            products={related}
            onAddToCart={(p) => dispatchAddToCart(p)}
          />
        </section>
      )}
    </div>
  );
}

export default function CatalogRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path=":id" element={<ProductDetail />} />
    </Routes>
  );
}
