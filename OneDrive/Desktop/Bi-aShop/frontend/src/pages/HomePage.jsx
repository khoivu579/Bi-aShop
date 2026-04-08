import { useEffect, useState } from 'react';
import { addCartItem } from '../services/cartApi';
import { API_ORIGIN } from '../services/api';
import { getProducts, resolveProductImageUrl } from '../services/productApi';
import { useAuth } from '../context/AuthContext';

function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN');
}

function HomePage() {
  const { token, isUser } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadProducts(searchText = '') {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts(searchText);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    loadProducts(search);
  }

  async function handleAddToCart(productId) {
    const normalizedProductId = Number(productId);
    if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) {
      setError('Product ID is invalid. Please refresh the page.');
      return;
    }

    if (!isUser) {
      setError('Only USER role can add to cart');
      return;
    }

    setMessage('');
    setError('');
    try {
      await addCartItem({ productId: normalizedProductId, quantity: 1 }, token);
      setMessage('Added to cart successfully');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="home-wrap">
      <section className="panel hero home-hero">
        <div className="home-hero-content">
          <p className="hero-tag">Billiard Store</p>
          <h1>Gậy Bi-a Chất Lượng, Chọn Nhanh</h1>
          <p>Danh mục gọn gàng, thao tác mua hàng đơn giản, phù hợp cả người mới và người chơi chuyên nghiệp.</p>
        </div>
        <div
          className="home-hero-image"
          aria-hidden="true"
          style={{ backgroundImage: `url(${API_ORIGIN}/uploads/bia-landing.png)` }}
        />
      </section>

      <section className="panel home-search-panel">
        <form className="search-row" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel home-catalog-panel">
        <h2>Cue Catalog</h2>
        {loading ? <p>Loading products...</p> : null}

        <div className="card-grid">
          {products.map((item) => (
            <div key={item.id} className="card home-card">
              <img src={resolveProductImageUrl(item.image_url)} alt={item.name} />
              <div className="card-body">
                <p className="brand">{item.brand}</p>
                <h3>{item.name}</h3>
                <p className="meta">{item.material || 'Unknown material'}</p>
                <p className="price">{formatPrice(item.price)} VND</p>
                <p className="stock">Stock: {item.stock}</p>
                {isUser ? (
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!Number.isInteger(Number(item.id))}
                  >
                    Add To Cart
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
