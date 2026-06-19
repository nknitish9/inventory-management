import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  IconClose,
  IconCustomers,
  IconDashboard,
  IconInventory,
  IconMenu,
  IconOrders,
  IconProducts,
} from './Icons';

const navItems = [
  { to: '/', label: 'Dashboard', Icon: IconDashboard },
  { to: '/products', label: 'Products', Icon: IconProducts },
  { to: '/customers', label: 'Customers', Icon: IconCustomers },
  { to: '/orders', label: 'Orders', Icon: IconOrders },
];

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/orders/') ? 'Order Details' : 'Inventory System');

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <IconInventory />
          </div>
          <div>
            <h1>InventoryPro</h1>
            <p>Order Management</p>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
            <IconClose />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>System Online</span>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <div className="topbar-content">
            <h2>{pageTitle}</h2>
            <span className="topbar-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
