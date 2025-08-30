import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HeaderDown.css'

const categories = [
  'All',
  'Watches',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Toys',
  'Beauty',
  'Sports',
  'Garden',
  'Automotive',
  'Health',
  'Groceries',
];

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Optional: Add a state to track loading for cart actions
  const [cartLoading, setCartLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Pass category query param only if not 'All'
        const categoryQuery = selectedCategory === 'All' ? '' : `?category=${selectedCategory}`;
        const res = await axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/api/products/category${categoryQuery}`);
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("token"); // assuming JWT token saved on login
    if (!token) {
      alert('Please log in to add products to your cart.');
      return;
    }

    try {
      setCartLoading(productId); // disable button while loading

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart/addtocart`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Product added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setCartLoading(null);
    }
  };

  return (
    <div>
      {/* Category Slider */}
      <nav className="category-slider">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-item ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      {/* Product Listing */}
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found in "{selectedCategory}" category.</p>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>${product.price.toFixed(2)}</p>
              <p>Stock: {product.stock}</p>
              <button
                disabled={cartLoading === product._id}
                onClick={() => handleAddToCart(product._id)}
              >
                {cartLoading === product._id ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
