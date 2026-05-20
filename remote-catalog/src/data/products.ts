export type Category = 'apparel' | 'bags' | 'tech' | 'footwear' | 'accessories';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  badge: string;
  category: Category;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  features: string[];
  colors: string[];
  sizes?: string[];
}

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All products' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'bags', label: 'Bags' },
  { id: 'tech', label: 'Tech' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'jacket',
    name: 'Modular Commuter Jacket',
    price: 148,
    originalPrice: 189,
    badge: 'Bestseller',
    category: 'apparel',
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1551028714-00167b16eac5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.8,
    reviewCount: 324,
    stock: 12,
    description:
      'Weather-ready shell with removable liner. Built for daily commutes and weekend trails alike.',
    features: ['Water-resistant DWR coating', 'Removable insulated liner', '6 zippered pockets'],
    colors: ['Slate', 'Forest', 'Midnight'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'pack',
    name: 'Everyday Field Pack',
    price: 96,
    badge: 'New',
    category: 'bags',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1622560480605-d67c945a0f40?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.6,
    reviewCount: 89,
    stock: 28,
    description: '28L capacity with laptop sleeve and quick-access front pocket.',
    features: ['Padded 16" laptop sleeve', 'Breathable back panel', 'Lifetime warranty'],
    colors: ['Olive', 'Sand', 'Black'],
  },
  {
    id: 'watch',
    name: 'Slate Fitness Watch',
    price: 214,
    originalPrice: 249,
    badge: 'Low stock',
    category: 'tech',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.5,
    reviewCount: 512,
    stock: 4,
    description: 'GPS, heart rate, sleep tracking, and 7-day battery in a slim aluminum case.',
    features: ['AMOLED display', '50m water resistance', 'Wireless charging'],
    colors: ['Graphite', 'Silver'],
  },
  {
    id: 'sneakers',
    name: 'Velocity Knit Runners',
    price: 132,
    badge: 'Trending',
    category: 'footwear',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1606107557195-0f27c3087f58?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.7,
    reviewCount: 201,
    stock: 18,
    description: 'Lightweight knit upper with responsive foam midsole for all-day comfort.',
    features: ['Breathable knit upper', 'Carbon plate', 'Recycled outsole'],
    colors: ['Coral', 'White', 'Navy'],
    sizes: ['7', '8', '9', '10', '11', '12'],
  },
  {
    id: 'headphones',
    name: 'Studio ANC Headphones',
    price: 279,
    badge: 'Editor pick',
    category: 'tech',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.9,
    reviewCount: 847,
    stock: 22,
    description: 'Industry-leading noise cancellation with 40-hour battery and spatial audio.',
    features: ['Adaptive ANC', 'Multipoint Bluetooth', 'Fold-flat design'],
    colors: ['Black', 'Cream'],
  },
  {
    id: 'sunglasses',
    name: 'Polarized Aviator Classics',
    price: 68,
    badge: 'Sale',
    category: 'accessories',
    image:
      'https://images.unsplash.com/photo-1572635196233-8f0f41b68686?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1572635196233-8f0f41b68686?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.4,
    reviewCount: 56,
    stock: 35,
    description: 'UV400 polarized lenses in a lightweight titanium frame.',
    features: ['Polarized lenses', 'Anti-glare coating', 'Includes hard case'],
    colors: ['Gold', 'Gunmetal'],
  },
  {
    id: 'hoodie',
    name: 'Heavyweight Fleece Hoodie',
    price: 78,
    originalPrice: 98,
    badge: 'Sale',
    category: 'apparel',
    image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.6,
    reviewCount: 178,
    stock: 41,
    description: '400gsm organic cotton fleece with double-lined hood and kangaroo pocket.',
    features: ['Organic cotton', 'Pre-shrunk', 'Reinforced seams'],
    colors: ['Heather Grey', 'Black', 'Burgundy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'bottle',
    name: 'Insulated Trail Bottle 32oz',
    price: 34,
    badge: 'Eco',
    category: 'accessories',
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.3,
    reviewCount: 92,
    stock: 67,
    description: 'Keeps drinks cold 24h or hot 12h. BPA-free stainless steel.',
    features: ['Double-wall vacuum', 'Leak-proof cap', 'Dishwasher safe'],
    colors: ['Steel', 'Matte Black', 'Sage'],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(
    0,
    limit,
  );
}
