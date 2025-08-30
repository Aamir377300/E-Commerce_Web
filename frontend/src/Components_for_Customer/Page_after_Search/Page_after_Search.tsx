import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/Header';
import './Page_after_Search.css';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

// Reuse cartService with addToCart API call
const cartService = {
  addToCart: async (productId: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please log in');
    return axios.post(
      `${import.meta.env.VITE_API_URL}/api/cart/addtocart`,
      { productId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

const SearchResults: React.FC = () => {
  const { searchTerm } = useParams<{ searchTerm: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/search?q=${encodeURIComponent(searchTerm || '')}`
        );
        setProducts(res.data.products);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm]);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      await cartService.addToCart(productId);
      alert('Product added to cart!');
    } catch (err) {
      alert('Failed to add product to cart. Please login or try again.');
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!products.length) return <p>No products match your search.</p>;

  return (
    <div>
      <Header />
      <ul className="products-list">
        {products.map((product) => (
          <li key={product._id}>
            <img src={product.image} alt={product.name} width={100} />
            <div>{product.name}</div>
            <div>{product.category}</div>
            <div>${product.price.toFixed(2)}</div>
            <button
              onClick={() => handleAddToCart(product._id)}
              disabled={addingToCart[product._id]}
              className="add-to-cart-btn"
            >
              {addingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
