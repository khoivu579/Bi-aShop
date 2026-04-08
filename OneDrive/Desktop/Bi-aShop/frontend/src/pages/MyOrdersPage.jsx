import { useEffect, useState } from 'react';
import { confirmReceivedOrder, getMyOrders } from '../services/orderApi';
import { createVnpayUrl } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';

function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN');
}

function MyOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      const data = await getMyOrders(token);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handlePay(order) {
    setError('');
    try {
      const data = await createVnpayUrl(order.id, token);
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmReceived(orderId) {
    setError('');
    try {
      await confirmReceivedOrder(orderId, token);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel">
      <h2>My Orders</h2>
      {error ? <p className="error">{error}</p> : null}

      <div className="order-list">
        {orders.map((order) => {
          const paid = (order.payments || []).every((pay) => pay.status === 'PAID');
          const isBankPayment = String(order.payment_method || '').toUpperCase() === 'BANK';
          return (
            <article key={order.id} className="order-card">
              <h3>Order #{order.id}</h3>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Total: {formatPrice(order.total_amount)} VND</p>
              <p>Address: {order.shipping_address}</p>
              <p>Payment Method: {order.payment_method}</p>
              <ul>
                {(order.items || []).map((item) => (
                  <li key={item.id}>{item.name} x {item.quantity}</li>
                ))}
              </ul>
              {!paid && isBankPayment ? (
                <button type="button" onClick={() => handlePay(order)}>
                  Pay with VNPay
                </button>
              ) : null}
              {paid ? <p className="success">Paid</p> : null}
              {!paid && !isBankPayment ? <p className="meta">Cash payment is processed automatically.</p> : null}
              {order.status === 'WAITING_APPROVE' ? (
                <button type="button" className="secondary" onClick={() => handleConfirmReceived(order.id)}>Đã nhận được hàng</button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MyOrdersPage;
