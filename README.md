# Micro Frontend Shop

AI-driven commerce demo built with Vite, React, TypeScript, and Module Federation.

This workspace contains three micro-frontends:

- `host-shell`: application shell, top-level routes, remote composition
- `remote-catalog`: product browsing, AI search, recommendations, shopping assistant
- `remote-cart`: mini cart, cart page, checkout flow, cart insights

The host dynamically loads remotes at runtime and coordinates state through browser events.

## Table of Contents

- [What this project demonstrates](#what-this-project-demonstrates)
- [Architecture overview](#architecture-overview)
- [Workspace structure](#workspace-structure)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Available scripts (root)](#available-scripts-root)
- [Run remotes manually (advanced)](#run-remotes-manually-advanced)
- [Module Federation contracts](#module-federation-contracts)
- [Cross-micro-frontend event contracts](#cross-micro-frontend-event-contracts)
- [Routing map](#routing-map)
- [Cart persistence model](#cart-persistence-model)
- [AI features and extension points](#ai-features-and-extension-points)
- [Build and preview flow](#build-and-preview-flow)
- [Troubleshooting](#troubleshooting)

## What this project demonstrates

- Runtime composition of React micro-frontends via `@originjs/vite-plugin-federation`
- Independent remotes for catalog and cart with a shared host shell
- Event-driven communication across remotes (`add-to-cart`, `cart-updated`, `ai-search`)
- AI-assisted discovery and recommendations in the catalog domain
- Single-command local startup orchestration across all apps

## Architecture overview

```text
Browser
	|
	+-- host-shell (http://localhost:5000)
			 |
			 +-- remoteCatalog remoteEntry.js (http://localhost:5001/assets/remoteEntry.js)
			 |     exposes catalog routes + shopping assistant + product UI
			 |
			 +-- remoteCart remoteEntry.js (http://localhost:5002/assets/remoteEntry.js)
						 exposes cart routes + mini cart + checkout UI

Shared libraries: react, react-dom, react-router-dom
State handoff: window CustomEvent + localStorage
```

## Workspace structure

```text
.
├─ host-shell/        # Host app that consumes remotes
├─ remote-catalog/    # Catalog domain micro-frontend
├─ remote-cart/       # Cart + checkout domain micro-frontend
├─ scripts/start.mjs  # Build remotes, start previews, then run host
├─ package.json       # Workspace-level scripts
└─ pnpm-workspace.yaml
```

## Tech stack

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Module Federation plugin: `@originjs/vite-plugin-federation`
- pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm 11+

Install dependencies from the workspace root:

```bash
pnpm install
```

## Quick start

Run everything from the root directory:

```bash
pnpm start
```

What `pnpm start` does:

1. Builds both remotes
2. Starts remote previews on ports `5001` and `5002`
3. Waits until both `remoteEntry.js` files are reachable
4. Starts the host shell on port `5000`

Open:

- Host: http://localhost:5000
- Catalog remote entry: http://localhost:5001/assets/remoteEntry.js
- Cart remote entry: http://localhost:5002/assets/remoteEntry.js

Stop all processes with `Ctrl+C` in the same terminal.

## Available scripts (root)

```bash
pnpm start           # Orchestrated local startup for all micro-frontends
pnpm build:remotes   # Build remote-catalog and remote-cart
pnpm dev:host        # Run host-shell dev server only (expects remotes running)
pnpm preview:catalog # Preview built catalog remote on 127.0.0.1:5001
pnpm preview:cart    # Preview built cart remote on 127.0.0.1:5002
```

## Run remotes manually (advanced)

If you want separate terminals:

Terminal 1:

```bash
pnpm --filter remote-catalog build
pnpm --filter remote-catalog preview --host 127.0.0.1
```

Terminal 2:

```bash
pnpm --filter remote-cart build
pnpm --filter remote-cart preview --host 127.0.0.1
```

Terminal 3:

```bash
pnpm --filter host-shell dev --host 127.0.0.1
```

## Module Federation contracts

Host remotes configured in `host-shell/vite.config.ts`:

- `remoteCatalog -> http://localhost:5001/assets/remoteEntry.js`
- `remoteCart -> http://localhost:5002/assets/remoteEntry.js`

### Exposed modules: remote-catalog

- `./ProductGrid`
- `./CatalogRoutes`
- `./ShoppingAssistant`
- `./ProductList`
- `./ProductDetail`

### Exposed modules: remote-cart

- `./MiniCart`
- `./CartRoutes`
- `./CartPage`

### Imported by host-shell

- `remoteCatalog/CatalogRoutes`
- `remoteCatalog/ShoppingAssistant`
- `remoteCart/CartRoutes`
- `remoteCart/MiniCart`

## Cross-micro-frontend event contracts

The apps communicate with browser events so remotes remain loosely coupled.

### `add-to-cart`

- Sender: catalog or assistant interactions
- Payload:

```ts
{ id: string; name: string; price: number; image?: string }
```

- Consumer: cart hook increments quantity or appends item

### `cart-updated`

- Sender: cart persistence utility after writes
- Payload:

```ts
CartItem[]
```

- Consumer: cart UIs and mini cart synchronize immediately

### `ai-search`

- Sender: AI assistant or AI search bar
- Payload: parsed `AISearchIntent`
- Consumer: catalog listing filters/sorts results

## Routing map

Host routes:

- `/` -> host home page
- `/products/*` -> catalog remote routes
- `/checkout/*` -> cart remote routes

Catalog remote routes include product listing and product detail pages.
Cart remote routes include cart page and payment/checkout flow.

## Cart persistence model

- Storage key: `mfe-shop-cart`
- Format: serialized `CartItem[]` in `localStorage`
- Totals calculation includes:
	- subtotal
	- shipping (`FREE` when subtotal is `0` or over `$100`)
	- estimated tax (`8.25%`)

## AI features and extension points

Catalog includes:

- Natural language search intent parsing (category, budget, sort)
- Intent-driven recommendations
- Product Q&A helper
- Shopping assistant actions (`reply`, `search`, `navigate`, `addToCart`)

### Optional external AI backend

By default, catalog runs with an in-browser AI engine.
To connect a backend model, set this variable for `remote-catalog`:

```bash
VITE_AI_API_URL=https://your-endpoint.example/api/chat
```

Expected API behavior:

- Accept a POST body containing user message and product metadata
- Return either `actions` (assistant actions) or fallback `message`

If the endpoint fails, the local AI engine is used automatically.

## Build and preview flow

For production-like remote loading locally:

```bash
pnpm build:remotes
pnpm preview:catalog
pnpm preview:cart
pnpm dev:host
```

## Troubleshooting

### Cannot find module `remoteCatalog/CatalogRoutes` (TypeScript)

Add ambient declarations in `host-shell/src/remotes.d.ts`:

```ts
declare module 'remoteCatalog/CatalogRoutes' {
	import React from 'react';
	const CatalogRoutes: React.ComponentType;
	export default CatalogRoutes;
}

declare module 'remoteCatalog/ShoppingAssistant' {
	import React from 'react';
	const ShoppingAssistant: React.ComponentType;
	export default ShoppingAssistant;
}

declare module 'remoteCart/CartRoutes' {
	import React from 'react';
	const CartRoutes: React.ComponentType;
	export default CartRoutes;
}

declare module 'remoteCart/MiniCart' {
	import React from 'react';
	const MiniCart: React.ComponentType;
	export default MiniCart;
}
```

Then restart TypeScript server in VS Code.

### Remote failed to load in host UI

- Confirm remotes are running on ports `5001` and `5002`
- Open both remote entry URLs in browser
- Ensure host is using `localhost` endpoints matching the remote preview ports

### Cart not updating across views

- Verify `localStorage` is available in the browser context
- Ensure `add-to-cart` and `cart-updated` events are not blocked by errors
- Clear `localStorage` key `mfe-shop-cart` and retest

### Port conflicts

Default ports:

- Host: `5000`
- Catalog remote: `5001`
- Cart remote: `5002`

Change ports in each app's `vite.config.ts` and keep host remote URLs in sync.