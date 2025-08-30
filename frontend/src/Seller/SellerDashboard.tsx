import React, { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import './SellerDashboard.css';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  seller?: string; // Ensure this property is present
}

interface SellerInfo {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

const apiUrl = import.meta.env.VITE_API_URL as string;

const SellerDashboard: React.FC = () => {
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Product form state
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState<number>(0);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token ? "Token exists" : "No token found");

        if (!token) {
          setError("Please log in to access the seller dashboard.");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch seller info with the token
        const sellerRes = await axios.get<SellerInfo>(
          `${apiUrl}/api/sellerDashboard/seller`,
          { headers }
        );
        setSellerInfo(sellerRes.data);

        // 2. Fetch products for the seller using the retrieved seller ID
        const productsRes = await axios.get<Product[]>(
          `${apiUrl}/api/sellerDashboard/${sellerRes.data._id}`,
          { headers }
        );
        setProducts(productsRes.data);

        // 3. Setup Socket.IO connection after successful data fetch
        const socketClient = io(apiUrl, {
          auth: { token },
        });
        setSocket(socketClient);

        socketClient.on("connect", () => {
          console.log("Connected to WebSocket server");
        });

        // Deduplicate products by _id when a product is added
        socketClient.on("productAdded", (newProduct: Product) => {
          console.log("New product received via socket:", newProduct);
          if (newProduct.seller === sellerRes.data._id) {
            setProducts((prev) =>
              prev.some((p) => p._id === newProduct._id) ? prev : [...prev, newProduct]
            );
          }
        });

        socketClient.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        setLoading(false);

      } catch (err: any) {
        console.error("Error fetching seller data:", err);

        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          localStorage.removeItem("token");
        } else if (err.response?.status === 403) {
          setError("Token expired. Please log in again.");
          localStorage.removeItem("token");
        } else {
          setError(err.response?.data?.error || err.message || "Failed to load seller data");
        }
        setLoading(false);
      }
    };

    fetchSellerData();

    // Cleanup function for the socket
    return () => {
      if (socket) {
        console.log("Disconnecting socket...");
        socket.disconnect();
      }
    };
  }, []);

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !sellerInfo) {
      alert("Cannot add product without authentication");
      return;
    }

    try {
      const productData = {
        name: productName,
        category,
        price,
        description,
        image,
        stock,
      };

      const response = await axios.post(
        `${apiUrl}/api/sellerDashboard/addProduct`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Product will be added via socket event
      setProductName("");
      setCategory("");
      setPrice(0);
      setDescription("");
      setImage("");
      setStock(0);

      alert("Product added successfully!");

    } catch (err: any) {
      console.error("Error adding product:", err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error occurred";
      alert("Error adding product: " + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="seller-dashboard">
        <p>Loading seller dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-dashboard">
        <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
          <h2>Authentication Required</h2>
          <p>{error}</p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="seller-dashboard">
        <p>No seller information available.</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <header className="seller-header">
        <h1>{sellerInfo.name}'s Dashboard</h1>
        <p>Phone: {sellerInfo.phone}</p>
        <p>Email: {sellerInfo.email}</p>
      </header>

      <section className="products-section">
        <h2>Your Products ({products.length})</h2>
        {products.length === 0 ? (
          <p>No products found. Add your first product below!</p>
        ) : (
          <ul className="product-list">
            {products.map((product) => (
              <li key={product._id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <p className="description">{product.description}</p>
                  <p className="price">${product.price.toFixed(2)}</p>
                  <p className="stock">Stock: {product.stock}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="add-product-section">
        <h2>Add New Product</h2>
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="url"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock || ''}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            min="0"
            required
          />
          <button type="submit">Add Product</button>
        </form>
      </section>
    </div>
  );
};

export default SellerDashboard;
