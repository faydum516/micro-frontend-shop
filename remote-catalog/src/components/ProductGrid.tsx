import './ProductGrid.css';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  badge: string;
}

const defaultProducts: Product[] = [
  {
    id: 'jacket',
    name: 'Modular Commuter Jacket',
    price: 148,
    badge: 'Bestseller',
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pack',
    name: 'Everyday Field Pack',
    price: 96,
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'watch',
    name: 'Slate Fitness Watch',
    price: 214,
    badge: 'Low stock',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  },
];



const ProductGrid = ({ products = defaultProducts }: { products?: Product[] }) => {
    
    // Create a function to dispatch a custom event on the global window object when a user clicks "Add to Cart"
    const addToCart = (product: Product) => {
        const event = new CustomEvent('add-to-cart', { detail: product });
        window.dispatchEvent(event);
    };

    return (
        <div className="product-grid" data-remote="remote-catalog">
        {products.map((product) => (
            <div key={product.id} className="product-card">
            <img className="product-image" src={product.image} alt={product.name} />
            <div className="product-details">
                <span className="product-badge">{product.badge}</span>
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <button className="add-to-cart-button" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
            </div>
        ))}
        </div>
    );
};

export default ProductGrid;
