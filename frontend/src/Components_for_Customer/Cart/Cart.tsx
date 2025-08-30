import React, { useEffect, useState } from "react";
import axios from "axios";
import './Cart.css'

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

// ---- API service layer ---- //
const cartService = {
  getCart: async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in.");
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.items || [];
  },

  updateQuantity: async (productId: string, quantity: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please log in");
    return axios.post(
      `${import.meta.env.VITE_API_URL}/api/cart/updateQuantity`,
      { productId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  removeItem: async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please log in");
    return axios.post(
      `${import.meta.env.VITE_API_URL}/api/cart/removeItem`,
      { productId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

// ---- Cart Component ---- //
const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const items = await cartService.getCart();
        setCartItems(items);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Optimistic update with rollback
  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: newQty } : item
      )
    );

    try {
      await cartService.updateQuantity(productId, newQty);
    } catch (err) {
      console.error("Failed to update quantity", err);
      setError("Failed to update cart. Please try again.");

      // Rollback
      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
      );
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const prevItems = [...cartItems];
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));

    try {
      await cartService.removeItem(productId);
    } catch (err) {
      console.error("Failed to remove item", err);
      setError("Failed to remove item. Please try again.");
      setCartItems(prevItems); // rollback
    }
  };

  // ---- Render states ---- //
  if (loading) return <p>Loading cart...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (cartItems.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(({ product, quantity }) => (
            <tr key={product._id}>
              <td>
                <img src={product.image} alt={product.name} className="cart-product-image" /> <br />
                {product.name}
              </td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                <button
                  onClick={() => handleUpdateQuantity(product._id, quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button
                  onClick={() =>
                    product.stock > quantity &&
                    handleUpdateQuantity(product._id, quantity + 1)
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </td>
              <td>${(product.price * quantity).toFixed(2)}</td>
              <td>
                <button className="remove-btn" onClick={() => handleRemoveItem(product._id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
          <tr className="cart-total-row">
            <td colSpan={3} style={{ textAlign: "right" }}>
              <strong>Total:</strong>
            </td>
            <td colSpan={2}>
              <strong>${getTotalPrice().toFixed(2)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Cart;
