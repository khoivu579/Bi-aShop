import { useEffect, useState } from 'react';
import { getCart, removeCartItem, updateCartItem } from '../services/cartApi';
import { checkout } from '../services/orderApi';
import { createVnpayUrl } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';

function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN');
}

function CartPage() {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadCart() {
    try {
      const data = await getCart(token);
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleUpdate(itemId, quantity) {
    setError('');
    try {
      const data = await updateCartItem(itemId, { quantity }, token);
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(itemId) {
    setError('');
    try {
      const data = await removeCartItem(itemId, token);
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const order = await checkout({ shippingAddress, paymentMethod }, token);
      if (paymentMethod === 'BANK') {
        const payment = await createVnpayUrl(order.id, token);
        if (payment.paymentUrl) {
          window.location.href = payment.paymentUrl;
          return;
        }
      }

      setMessage(`Order #${order.id} created successfully`);
      setShippingAddress('');
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel">
      <h2>My Cart</h2>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{formatPrice(item.price)} VND</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => handleUpdate(item.id, Number(event.target.value || 1))}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => handleRemove(item.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="price">Total: {formatPrice(cart.totalAmount)} VND</p>

      <form className="product-form" onSubmit={handleCheckout}>
        <label>
          Shipping Address
          <input value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} required />
        </label>
        <label>
          Payment Method
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="CASH">CASH</option>
            <option value="BANK">BANK</option>
          </select>
        </label>
        <button type="submit">Checkout</button>
      </form>
    </section>
  );
}

export default CartPage;
