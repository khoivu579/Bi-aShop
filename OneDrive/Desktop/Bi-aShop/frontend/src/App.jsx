import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import StaffOrdersPage from './pages/StaffOrdersPage';

function App() {
  return (
    <div className="page">
      <div className="bg-orb orb-left" />
      <div className="bg-orb orb-right" />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/cart"
          element={(
            <ProtectedRoute allowedRoles={['USER']}>
              <CartPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/my-orders"
          element={(
            <ProtectedRoute allowedRoles={['USER']}>
              <MyOrdersPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/staff/orders"
          element={(
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffOrdersPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/products"
          element={(
            <ProtectedRoute adminOnly>
              <AdminProductsPage />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </div>
  );
}

export default App;
