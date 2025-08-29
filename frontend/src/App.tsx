import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login/Login";
import Signup from "./Signup/Signup"
import MainPage from "./Mainpage/Mainpage";
import SellerDashboard from "./Seller/SellerDashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mainpage" replace />} />
      <Route path="/mainpage" element={<MainPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/sellerdashboard" element={<SellerDashboard />} />
    </Routes>
  );
}

export default App;
