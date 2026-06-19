import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IconOrders } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      setOrder(await api.getOrder(id));
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state-box">
          <IconOrders size={40} />
          <h3>Order not found</h3>
          <p>The order you're looking for doesn't exist or was removed.</p>
          <Link to="/orders" className="btn btn-secondary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={`Order #${order.id}`}
        subtitle={`Placed on ${new Date(order.created_at).toLocaleString()}`}
        action={<Link to="/orders" className="btn btn-secondary">← Back to Orders</Link>}
      />

      <div className="detail-grid">
        <div className="card detail-card">
          <h3>Order Summary</h3>
          <dl className="detail-list">
            <div>
              <dt>Order ID</dt>
              <dd><span className="order-id">#{order.id}</span></dd>
            </div>
            <div>
              <dt>Customer</dt>
              <dd>{order.customer_name || `Customer #${order.customer_id}`}</dd>
            </div>
            <div>
              <dt>Total Amount</dt>
              <dd className="total-amount">₹{order.total_amount.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Line Items</dt>
              <dd>{order.items.length} product{order.items.length !== 1 ? 's' : ''}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd><span className="badge badge-success">Confirmed</span></dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h3>Line Items</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.product_name || `Product #${item.product_id}`}</strong></td>
                    <td data-label="Unit Price" className="money">₹{item.unit_price.toFixed(2)}</td>
                    <td data-label="Qty">{item.quantity}</td>
                    <td data-label="Subtotal" className="money">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Order Total</strong></td>
                  <td className="money"><strong>₹{order.total_amount.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
