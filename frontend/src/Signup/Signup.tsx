import React, { useState, FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL as string;

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("customer"); // default role
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!name || !email || !password || !phone || !role) {
      setErrorMessage("Please fill all fields including role");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const apiObj = { name, email, password, phone, role };
      await axios.post(`${apiUrl}/api/auth/signup`, apiObj);

      alert("Signup complete ✅");

      // Navigate based on role
      if (role === "customer") {
        navigate("/mainpage");
      } else if (role === "seller") {
        navigate("/login");
      } else if (role === "deliveryboy") {
        navigate("/delivery");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Signup failed ❌";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2>Create Account</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          value={name}
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />

        <input
          type="email"
          value={email}
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <input
          type="password"
          value={password}
          placeholder="Create Password (min. 6 characters)"
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <input
          type="tel"
          value={phone}
          placeholder="Phone Number"
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
        />

        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="deliveryboy">Delivery Boy</option>
        </select>

        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div>
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </div>
  );
}

export default Signup;
