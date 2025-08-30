import type { FC } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Search_Bar_Input from '../Search_Bar_Input/Search_Bar_Input'

export const Header: FC = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src="/logo.png" alt="E-commerce Logo" className="logo" />
        </Link>
        
      </div>

      <div className="search-container">
        <Search_Bar_Input />
      </div>



      <nav className="nav-links">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/cart">Cart</Link>
        <Link className="nav-link" to="/login">Sign In</Link>
        <Link className="nav-link" to="/signup">Sign Up</Link>
        <Link className="nav-link" to="/cart">Cart</Link>
      </nav>
    </header>
  );
};

export default Header;
