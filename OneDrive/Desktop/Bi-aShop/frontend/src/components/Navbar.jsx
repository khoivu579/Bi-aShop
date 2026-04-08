import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAdmin, isStaff, isUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="nav-wrap panel">
      <div className="nav-brand">
        <Link to="/">Bi-a Cue Shop</Link>
      </div>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        {isUser ? <NavLink to="/cart">Cart</NavLink> : null}
        {isUser ? <NavLink to="/my-orders">My Orders</NavLink> : null}
        {isStaff ? <NavLink to="/staff/orders">Staff</NavLink> : null}
        {isAdmin ? <NavLink to="/admin/products">Admin</NavLink> : null}
      </nav>
      <div className="nav-user">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="btn-link">Login</Link>
            <Link to="/register" className="btn-link">Register</Link>
          </>
        ) : (
          <>
            <span>{user?.fullName} ({user?.role})</span>
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
