import axios from "axios";
import React, { useState, type JSX } from "react";
import { useNavigate, Link } from "react-router-dom";

const apiUrl: string = import.meta.env.VITE_API_URL as string;

interface LoginResponse {
  token: string;
  role: string;
}

function Login(): JSX.Element {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill all fields");
      setIsLoading(false);
      return;
    }
    try {
      const apiObj = { email, password };

      const res = await axios.post<LoginResponse>(`${apiUrl}/api/auth/login`, apiObj);

      const token = res.data.token;
      const role = res.data.role;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        alert("Login successful");

        // Role based navigation
        if (role === "customer") {
          navigate("/mainpage");
        } else if (role === "seller") {
          navigate("/sellerdashboard");
        } else if (role === "deliveryboy") {
          navigate("/deliverydashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        (axios.isAxiosError(err) && err.response?.data?.error) ||
        "Login failed. Please check your credentials.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}

export default Login;
