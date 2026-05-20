import React, { Suspense } from 'react';
import './App.css';

// @ts-ignore - Let TypeScript know these are resolved via Module Federation
const RemoteProductGrid = React.lazy(() => import('remoteCatalog/ProductGrid'));
// @ts-ignore
const RemoteMiniCart = React.lazy(() => import('remoteCart/MiniCart'));

function App() {
  return (
    <div className="shell-app">
      <header className="shell-header">
        <div>
          <p className="shell-eyebrow">Host shell</p>
          <h1>Enterprise Shell Shop</h1>
        </div>

        <Suspense fallback={<div className="shell-spinner" aria-label="Loading cart" />}>
          <RemoteMiniCart />
        </Suspense>
      </header>

      <main className="shell-main">
        <div className="shell-section-heading">
          <p className="shell-eyebrow">Remote catalog</p>
          <h2>Trending Products</h2>
        </div>

        <Suspense fallback={<div className="shell-loading">Loading catalog app...</div>}>
          <RemoteProductGrid />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
