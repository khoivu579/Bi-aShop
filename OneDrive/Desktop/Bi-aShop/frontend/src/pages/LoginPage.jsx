import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form);
      if (user.role === 'ADMIN') {
        navigate('/admin/products');
      } else if (user.role === 'STAFF') {
        navigate('/staff/orders');
      } else if (user.role === 'USER') {
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <h2>Login</h2>
      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      <p className="meta">Admin seed: admin@gmail.com / Admin@123</p>
      <p className="meta">Staff seed: staff@gmail.com / Staff@123</p>
      <p className="meta">User seed: user@gmail.com / User@123</p>
    </section>
  );
}

export default LoginPage;
