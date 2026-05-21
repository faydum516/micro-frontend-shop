import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const RemoteCatalogRoutes = React.lazy(() => import('remoteCatalog/CatalogRoutes'));
const RemoteCartRoutes = React.lazy(() => import('remoteCart/CartRoutes'));
const RemoteMiniCart = React.lazy(() => import('remoteCart/MiniCart'));
const RemoteShoppingAssistant = React.lazy(() => import('remoteCatalog/ShoppingAssistant'));

function LoadingFallback({ label }: { label: string }) {
  return (
    <div className="shell-loading">
      <div className="shell-spinner" style={{ margin: '0 auto 16px' }} />
      <p>{label}</p>
    </div>
  );
}

function RemoteRoute({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="shell-404">
          <h2>Remote failed to load</h2>
          <p>
            Ensure remotes are running on ports 5001 and 5002, then run{' '}
            <code>pnpm start</code>.
          </p>
          <Link to="/">Return home</Link>
        </div>
      }
    >
      <Suspense fallback={<LoadingFallback label={label} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="shell-app">
        <header className="shell-header">
          <div className="shell-brand">
            <p className="shell-eyebrow">Micro-Frontend Shop</p>
            <Link to="/">
              <h1>Nexus Commerce</h1>
            </Link>
          </div>

          <nav className="shell-nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
              Catalog
            </NavLink>
            <NavLink to="/checkout" className={({ isActive }) => (isActive ? 'active' : '')}>
              Cart
            </NavLink>
          </nav>

          <ErrorBoundary
            fallback={
              <Link to="/checkout" className="mini-cart-skeleton">
                Cart
              </Link>
            }
          >
            <Suspense fallback={<div className="mini-cart-skeleton">Cart...</div>}>
              <RemoteMiniCart />
            </Suspense>
          </ErrorBoundary>
        </header>

        <main className="shell-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/products/*"
              element={
                <RemoteRoute label="Loading catalog...">
                  <RemoteCatalogRoutes />
                </RemoteRoute>
              }
            />
            <Route
              path="/checkout/*"
              element={
                <RemoteRoute label="Loading cart...">
                  <RemoteCartRoutes />
                </RemoteRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="shell-404">
                  <h2>404 — Page not found</h2>
                  <p>This route is not mapped to any micro-frontend.</p>
                  <Link to="/">Return home</Link>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="shell-footer">
          <span>© 2026 Nexus Commerce</span>
          <span className="shell-footer-tech">AI Commerce · Module Federation · pnpm</span>
        </footer>

        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <RemoteShoppingAssistant />
          </Suspense>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}
