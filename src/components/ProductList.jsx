import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const isAdmin = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const visibleProducts = products.filter((product) => {
    const search = query.trim().toLowerCase();
    return !search || `${product.product_name} ${product.description} ${product.id}`.toLowerCase().includes(search);
  });
  const totalUnits = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const inventoryValue = products.reduce((total, product) => total + Number(product.price || 0) * Number(product.quantity || 0), 0);
  const initials = user.username.slice(0, 2);
  const today = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div><div className="brand-name">Pallet &amp; Pine</div><div className="brand-caption">Stockroom</div></div>
        </div>
        <div className="nav-label">Workspace</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#inventory"><span className="nav-glyph">▦</span>Inventory</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-tag">Stockroom note</div>
            <p className="note-copy">Keep every item accounted for. Your inventory is ready when you are.</p>
          </div>
        </div>
      </aside>

      <main className="workspace" id="inventory">
        <div className="topbar">
          <div className="topbar-right">
            <span className="top-date">{today}</span>
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div><div className="user-name">{user.username}</div><div className="user-role">{user.role}</div></div>
            </div>
            <button className="logout-button" onClick={onLogout}>Sign out</button>
          </div>
        </div>

        <div className="page-content">
          <div className="heading-row">
            <div>
              <div className="eyebrow">Stockroom / Catalog</div>
              <h1 className="page-heading">Inventory</h1>
              <p className="page-subtitle">A clear view of everything in your product catalog.</p>
            </div>
            {isAdmin && <button className="button-primary" onClick={() => setFormFor({})}><span className="button-plus">+</span> Add product</button>}
          </div>

          <section className="summary-grid" aria-label="Inventory summary">
            <article className="summary-card"><div className="summary-label">Catalog items<span className="summary-mark">▦</span></div><div className="summary-value">{products.length}<span className="summary-foot">products</span></div></article>
            <article className="summary-card"><div className="summary-label">Units in stock<span className="summary-mark">↗</span></div><div className="summary-value">{totalUnits.toLocaleString()}</div></article>
            <article className="summary-card"><div className="summary-label">Stock value<span className="summary-mark">₱</span></div><div className="summary-value">{peso.format(inventoryValue)}</div></article>
          </section>

          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}</div>}

          <section className="catalog-section" aria-labelledby="catalog-title">
            <div className="section-heading">
              <h2 className="section-title" id="catalog-title">Product catalog<span className="section-count">{visibleProducts.length} shown</span></h2>
              <div className="catalog-tools">
                <label className="search-box"><span className="search-glyph" aria-hidden="true">⌕</span><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label>
                {!isAdmin && <span className="role-pill">View only</span>}
              </div>
            </div>

            <div className="catalog-card">
              {loading ? <div className="loading-state">Loading inventory...</div> : (
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Item</th><th>Product</th><th>Description</th><th>Unit price</th><th>In stock</th><th>Added</th>{isAdmin && <th aria-label="Actions"></th>}</tr></thead>
                    <tbody>
                      {visibleProducts.length === 0 ? (
                        <tr><td colSpan={isAdmin ? 7 : 6}><div className="empty-state"><div className="empty-icon">⌕</div>{query ? 'No products match your search.' : 'There are no products in the catalog yet.'}</div></td></tr>
                      ) : visibleProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="product-id">#{String(product.id).padStart(3, '0')}</td>
                          <td><span className="product-name">{product.product_name}</span></td>
                          <td><div className="product-description" title={product.description}>{product.description || '—'}</div></td>
                          <td className="price-cell">{peso.format(product.price)}</td>
                          <td><span className="quantity-value">{Number(product.quantity).toLocaleString()}</span></td>
                          <td className="date-cell">{product.created_at || '—'}</td>
                          {isAdmin && <td className="actions-cell"><button className="icon-button" aria-label={`Edit ${product.product_name}`} title="Edit" onClick={() => setFormFor(product)}>Edit</button><button className="icon-button delete" aria-label={`Delete ${product.product_name}`} title="Delete" onClick={() => handleDelete(product)}>Delete</button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {isAdmin && formFor && <ProductForm product={formFor.id ? formFor : null} onSaved={handleSaved} onCancel={() => setFormFor(null)} />}
    </div>
  );
}
