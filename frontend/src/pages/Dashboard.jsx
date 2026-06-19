import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { IconProducts } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import { SkeletonStats } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const statConfig = [
  { key: 'total_products', label: 'Total Products', variant: 'products', link: '/products' },
  { key: 'total_customers', label: 'Total Customers', variant: 'customers', link: '/customers' },
  { key: 'total_orders', label: 'Total Orders', variant: 'orders', link: '/orders' },
  { key: 'low_stock_count', label: 'Low Stock Items', variant: 'warning', link: '/products' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats({
        ...data,
        low_stock_count: data.low_stock_products.length,
      });
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your inventory and sales"
      />

      {loading ? (
        <SkeletonStats />
      ) : stats ? (
        <>
          <div className="stats-grid">
            {statConfig.map(({ key, label, variant, link }) => (
              <Link key={key} to={link} className={`stat-card stat-card-${variant}`}>
                <div className="stat-card-content">
                  <p className="stat-label">{label}</p>
                  <p className="stat-value">{stats[key]}</p>
                </div>
                <div className="stat-card-accent" />
              </Link>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3>Low Stock Alert</h3>
                <p className="card-subtitle">Products with 10 or fewer units in stock</p>
              </div>
              <Link to="/products" className="btn btn-secondary btn-sm">Manage Products</Link>
            </div>
            {stats.low_stock_products.length === 0 ? (
              <EmptyState
                icon={<IconProducts size={40} />}
                title="All stocked up!"
                description="No products are currently running low on inventory."
              />
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.low_stock_products.map((product) => (
                      <tr key={product.id}>
                        <td><strong>{product.name}</strong></td>
                        <td><code>{product.sku}</code></td>
                        <td className="money">${product.price.toFixed(2)}</td>
                        <td>
                          <div className="stock-bar">
                            <div
                              className="stock-bar-fill"
                              style={{ width: `${Math.min(product.quantity_in_stock * 10, 100)}%` }}
                            />
                          </div>
                          <span className="stock-count">{product.quantity_in_stock} units</span>
                        </td>
                        <td>
                          <span className={`badge ${product.quantity_in_stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                            {product.quantity_in_stock === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
