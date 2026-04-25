# toto-react

Shared React components, hooks, contexts, and API clients for **Toto PWAs**.

`toto-react` is a standalone, publishable npm package that provides the common UI building blocks used across all Toto frontend applications (e.g. [toto-suppie](https://github.com/nicolasances/toto-suppie)).

---

## Installation

```bash
npm install toto-react
```

Or install locally from a checkout:

```bash
npm install /path/to/toto-react
```

---

## Usage

### Client-side (components, hooks, contexts)

```ts
import { TotoContext, useToto } from 'toto-react';
```

### Server-side (Next.js API route handlers)

Re-export the built-in STT/TTS handlers inside your app's `app/api/` routes:

```ts
// app/api/stt/route.ts
export { sttHandler as POST } from 'toto-react/server';
```

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Build

```bash
npm install
npm run build
```

This produces a `dist/` folder containing:
- `index.js` / `index.mjs` — CJS and ESM bundles for client-side exports
- `server.js` / `server.mjs` — CJS and ESM bundles for server-side exports
- `*.d.ts` — TypeScript declaration files

### Type-check only (no emit)

```bash
npm run typecheck
```

### Watch mode

```bash
npm run dev
```

---

## Package structure

```
toto-react/
├── src/
│   ├── index.ts     # Client-side barrel (components, hooks, contexts, API clients)
│   └── server.ts    # Server-side barrel (Next.js API route handlers)
├── dist/            # Build output (generated, not committed)
├── tsup.config.ts   # Build configuration
└── tsconfig.json    # TypeScript configuration
```

---

## Peer dependencies

| Package | Version |
|---------|---------|
| `react` | ≥ 18    |
| `next`  | ≥ 14    |

---

## Toto Ecosystem

For the full list of Toto repositories, SDKs, and tooling, see the [Toto documentation repo](https://github.com/nicolasances/toto).
