import type { FC } from 'react';
import { Link } from 'react-router-dom';
import './HeaderDown.css';

const categories = [
  'Watches',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Toys',
  'Beauty',
  'Sports',
  'Garden',
  'Automotive',
  'Health',
  'Groceries',
];

export const HeaderDown: FC = () => {
  return (
    <nav className="header-down">
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category} className="category-item">
            <Link to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`} className="category-link">
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderDown;
