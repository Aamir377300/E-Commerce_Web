import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login/Login";
import Signup from "./Signup/Signup"
import MainPage from "./Mainpage/Mainpage";
import SellerDashboard from "./Seller/SellerDashboard"
import Cart from "./Components_for_Customer/Cart/Cart";
import Page_after_Search from "./Components_for_Customer/Page_after_Search/Page_after_Search"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mainpage" replace />} />
      <Route path="/mainpage" element={<MainPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/sellerdashboard" element={<SellerDashboard />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/search/:searchTerm" element={<Page_after_Search />} />
    </Routes>
  );
}

export default App;
