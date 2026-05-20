import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  addedId?: string | null;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="product-stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

const ProductGrid = ({ products, onAddToCart, addedId }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products match your filters. Try adjusting search or category.</p>
      </div>
    );
  }

  return (
    <div className="product-grid" data-remote="remote-catalog">
      {products.map((product) => {
        const discount =
          product.originalPrice &&
          Math.round((1 - product.price / product.originalPrice) * 100);
        return (
          <article key={product.id} className="product-card">
            <Link to={`/products/${product.id}`} className="product-image-link">
              <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
              {discount ? <span className="product-discount">-{discount}%</span> : null}
            </Link>
            <div className="product-details">
              <span className={`product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                {product.badge}
              </span>
              <Link to={`/products/${product.id}`} className="product-title-link">
                <h3>{product.name}</h3>
              </Link>
              <div className="product-meta">
                <StarRating rating={product.rating} />
                <span className="product-reviews">({product.reviewCount})</span>
              </div>
              <div className="product-price-row">
                <p className="product-price">${product.price}</p>
                {product.originalPrice ? (
                  <p className="product-price-original">${product.originalPrice}</p>
                ) : null}
              </div>
              <button
                type="button"
                className={`add-to-cart-button ${addedId === product.id ? 'added' : ''}`}
                onClick={() => onAddToCart(product)}
              >
                {addedId === product.id ? '✓ Added' : 'Add to Cart'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ProductGrid;
