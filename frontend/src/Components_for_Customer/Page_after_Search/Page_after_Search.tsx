import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/Header';
import './Page_after_Search.css'

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

const SearchResults: React.FC = () => {
  const { searchTerm } = useParams<{ searchTerm: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Assuming your backend supports search by query param 'q'
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
