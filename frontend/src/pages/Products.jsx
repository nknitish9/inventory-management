import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { IconPlus, IconProducts } from '../components/Icons';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import { SkeletonRows } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  async function loadProducts() {
    try {
      setLoading(true);
      setProducts(await api.getProducts());
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.sku.trim()) errors.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) <= 0) errors.price = 'Price must be greater than 0';
    if (form.quantity_in_stock === '' || parseInt(form.quantity_in_stock) < 0) {
      errors.quantity_in_stock = 'Quantity must be 0 or greater';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock),
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.createProduct(payload);
        showToast('Product created successfully', 'success');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product deleted successfully', 'success');
      loadProducts();
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''} in inventory`}
        action={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <IconPlus /> Add Product
          </button>
        }
      />

      <div className="card">
        <div className="card-toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or SKU..." />
        </div>

        {loading ? (
          <SkeletonRows rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconProducts size={40} />}
            title={search ? 'No matching products' : 'No products yet'}
            description={search ? 'Try a different search term.' : 'Add your first product to start tracking inventory.'}
            action={!search && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                <IconPlus /> Add Product
              </button>
            )}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td data-label="SKU"><code>{product.sku}</code></td>
                    <td data-label="Price" className="money">${product.price.toFixed(2)}</td>
                    <td data-label="Stock">
                      <span className={`badge ${
                        product.quantity_in_stock === 0
                          ? 'badge-danger'
                          : product.quantity_in_stock <= 10
                            ? 'badge-warning'
                            : 'badge-success'
                      }`}>
                        {product.quantity_in_stock} units
                      </span>
                    </td>
                    <td data-label="Actions" className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(product)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Wireless Mouse"
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="sku">SKU / Code *</label>
            <input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. WM-001"
              className={formErrors.sku ? 'input-error' : ''}
            />
            {formErrors.sku && <span className="field-error">{formErrors.sku}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className={formErrors.price ? 'input-error' : ''}
              />
              {formErrors.price && <span className="field-error">{formErrors.price}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity in Stock *</label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                placeholder="0"
                className={formErrors.quantity_in_stock ? 'input-error' : ''}
              />
              {formErrors.quantity_in_stock && <span className="field-error">{formErrors.quantity_in_stock}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
