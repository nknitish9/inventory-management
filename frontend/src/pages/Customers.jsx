import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { IconCustomers, IconPlus } from '../components/Icons';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import { SkeletonRows } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, search]);

  async function loadCustomers() {
    try {
      setLoading(true);
      setCustomers(await api.getCustomers());
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = 'Full name is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email address';
    }
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      showToast('Customer created successfully', 'success');
      setModalOpen(false);
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      showToast('Customer deleted successfully', 'success');
      loadCustomers();
    } catch (err) {
      showToast(err.message);
    }
  }

  function openModal() {
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  return (
    <div className="page">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} registered customer${customers.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn btn-primary" onClick={openModal}>
            <IconPlus /> Add Customer
          </button>
        }
      />

      <div className="card">
        <div className="card-toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." />
        </div>

        {loading ? (
          <SkeletonRows rows={5} cols={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconCustomers size={40} />}
            title={search ? 'No matching customers' : 'No customers yet'}
            description={search ? 'Try a different search term.' : 'Add your first customer to start creating orders.'}
            action={!search && (
              <button className="btn btn-primary" onClick={openModal}>
                <IconPlus /> Add Customer
              </button>
            )}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <span className="avatar">{customer.full_name.charAt(0).toUpperCase()}</span>
                        <strong>{customer.full_name}</strong>
                      </div>
                    </td>
                    <td data-label="Email">{customer.email}</td>
                    <td data-label="Phone">{customer.phone}</td>
                    <td data-label="Joined" className="text-muted">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td data-label="Actions" className="actions">
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(customer.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="John Doe"
              className={formErrors.full_name ? 'input-error' : ''}
            />
            {formErrors.full_name && <span className="field-error">{formErrors.full_name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com"
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className={formErrors.phone ? 'input-error' : ''}
            />
            {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
