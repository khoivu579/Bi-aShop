import { useEffect, useState } from 'react';
import { getStaffOrders, updateStaffOrderStatus } from '../services/orderApi';
import { useAuth } from '../context/AuthContext';

function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN');
}

function StaffOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await getStaffOrders(token);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatus(orderId, status) {
    setError('');
    setMessage('');
    try {
      await updateStaffOrderStatus(orderId, status, token);
      setMessage(`Order #${orderId} updated to ${status}`);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel">
      <h2>Staff Delivery Orders</h2>
      <p className="meta">Danh sách đơn cho staff theo dõi (PENDING, SHIPPING, WAITING_APPROVE, COMPLETED)</p>
      {loading ? <p>Loading orders...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.full_name || order.email}</td>
                <td>{formatPrice(order.total_amount)} VND</td>
                <td>{order.status}</td>
                <td>{order.shipping_address}</td>
                <td>
                  <div className="action-row">
                    {order.status === 'PENDING' ? (
                      <button type="button" onClick={() => handleStatus(order.id, 'SHIPPING')}>Mark SHIPPING</button>
                    ) : null}
                    {order.status === 'SHIPPING' ? (
                      <button type="button" className="secondary" onClick={() => handleStatus(order.id, 'WAITING_APPROVE')}>Mark WAITING_APPROVE</button>
                    ) : null}
                    {order.status === 'WAITING_APPROVE' ? <span className="action-empty">Waiting customer confirm</span> : null}
                    {order.status === 'COMPLETED' ? <span className="action-empty">Done</span> : null}
                    {order.status === 'CANCELLED' ? <span className="action-empty">Cancelled</span> : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 ? (
              <tr>
                <td colSpan="6">No orders for staff handling.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StaffOrdersPage;
