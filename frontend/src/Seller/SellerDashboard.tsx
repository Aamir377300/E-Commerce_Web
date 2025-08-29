import React, { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
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
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        // Fetch seller info
        const sellerRes = await axios.get<SellerInfo>(
          `${apiUrl}/api/sellerDashboard/seller`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSellerInfo(sellerRes.data);

        // Fetch products for the seller
        const productsRes = await axios.get<Product[]>(
          `${apiUrl}/api/sellerDashboard/${sellerRes.data._id}`, // Use correct sellerId
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(productsRes.data);

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load seller data");
        setLoading(false);
      }
    };

    fetchSellerData();

    // Setup Socket.IO
    const socketClient = io(apiUrl);
    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketClient.on("productAdded", (newProduct: Product) => {
      if (sellerInfo && newProduct.seller === sellerInfo._id) {
        setProducts((prev) => [...prev, newProduct]);
      }
    });

    return () => {
      socketClient.disconnect();
    };
  }, [sellerInfo]);

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !sellerInfo) {
      alert("Cannot add product without authentication");
      return;
    }

    try {
      const productData = {
        sellerId: sellerInfo._id,
        name: productName,
        category,
        price,
        description,
        image,
        stock,
      };

      await axios.post(`${apiUrl}/api/sellerDashboard/addProduct`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear form
      setProductName("");
      setCategory("");
      setPrice(0);
      setDescription("");
      setImage("");
      setStock(0);
    } catch (err: any) {
      alert("Error adding product: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <p>Loading seller dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="seller-dashboard">
      <header className="seller-header">
        <h1>{sellerInfo?.name}'s Dashboard</h1>
        <p>Phone: {sellerInfo?.phone}</p>
        <p>Email: {sellerInfo?.email}</p>
      </header>

      <section className="products-section">
        <h2>Your Products</h2>
        {products.length === 0 && <p>No products found.</p>}
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
      </section>

      <section className="add-product-section">
        <h2>Add New Product</h2>
        <form onSubmit={handleAddProduct}>
          <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(parseInt(e.target.value))} required />
          <button type="submit">Add Product</button>
        </form>
      </section>
    </div>
  );
};

export default SellerDashboard;
