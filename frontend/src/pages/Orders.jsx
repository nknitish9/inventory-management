import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { IconOrders, IconPlus } from '../components/Icons';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import { SkeletonRows } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

function truncate(str, len = 30) {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: '' }]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q))
    );
  }, [orders, search]);

  async function loadData() {
    try {
      setLoading(true);
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCustomerId('');
    setItems([{ product_id: '', quantity: '' }]);
    setFormErrors({});
  }

  function addItem() {
    setItems([...items, { product_id: '', quantity: '' }]);
  }

  function removeItem(index) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (product && item.quantity) {
        return sum + product.price * parseInt(item.quantity);
      }
      return sum;
    }, 0);
  }, [items, products]);

  function validateForm() {
    const errors = {};
    if (!customerId) errors.customer = 'Please select a customer';
    items.forEach((item, i) => {
      if (!item.product_id) errors[`product_${i}`] = 'Select a product';
      if (!item.quantity || parseInt(item.quantity) <= 0) errors[`quantity_${i}`] = 'Qty must be > 0';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.createOrder({
        customer_id: parseInt(customerId),
        items: items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      });
      showToast('Order created successfully', 'success');
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Cancel this order? Product stock will be restored.')) return;
    try {
      await api.deleteOrder(id);
      showToast('Order cancelled successfully', 'success');
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
        action={
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            <IconPlus /> Create Order
          </button>
        }
      />

      <div className="card">
        <div className="card-toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID or customer..." />
        </div>

        {loading ? (
          <SkeletonRows rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconOrders size={40} />}
            title={search ? 'No matching orders' : 'No orders yet'}
            description={search ? 'Try a different search term.' : 'Create your first order to get started.'}
            action={!search && (
              <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
                <IconPlus /> Create Order
              </button>
            )}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id">#{order.id}</span></td>
                    <td data-label="Customer">{order.customer_name || `Customer #${order.customer_id}`}</td>
                    <td data-label="Items">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td data-label="Total" className="money"><strong>₹{order.total_amount.toFixed(2)}</strong></td>
                    <td data-label="Date" className="text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td data-label="Actions" className="actions">
                      <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(order.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Order" wide>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="customer">Customer *</label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={formErrors.customer ? 'input-error' : ''}
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
              ))}
            </select>
            {formErrors.customer && <span className="field-error">{formErrors.customer}</span>}
            {customers.length === 0 && (
              <span className="field-hint">No customers found. Add a customer first.</span>
            )}
          </div>

          <div className="order-items-section">
            <div className="section-header">
              <label>Order Items *</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                <IconPlus size={14} /> Add Item
              </button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="order-item-row">
                <div className="form-group">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className={formErrors[`product_${index}`] ? 'input-error' : ''}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} title={`${p.name} — ₹${p.price.toFixed(2)} (Stock: ${p.quantity_in_stock})`}>
                        {truncate(p.name, 15)}{p.name.length > 15 ? '…' : ''} (₹{p.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {formErrors[`product_${index}`] && (
                    <span className="field-error">{formErrors[`product_${index}`]}</span>
                  )}
                </div>
                <div className="form-group quantity-input">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className={formErrors[`quantity_${index}`] ? 'input-error' : ''}
                  />
                  {formErrors[`quantity_${index}`] && (
                    <span className="field-error">{formErrors[`quantity_${index}`]}</span>
                  )}
                </div>
                {items.length > 1 && (
                  <button type="button" className="btn btn-icon btn-danger" onClick={() => removeItem(index)} aria-label="Remove item">
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {estimatedTotal > 0 && (
            <div className="order-estimate">
              <span>Estimated Total</span>
              <strong>₹{estimatedTotal.toFixed(2)}</strong>
              <span className="field-hint">Final amount calculated by server</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || customers.length === 0 || products.length === 0}>
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
