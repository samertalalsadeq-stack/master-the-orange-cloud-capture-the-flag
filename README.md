# Cloudflare Workers Chat Application Template

[cloudflarebutton]

A production-ready full-stack chat application template built on Cloudflare Workers. This template provides a modern React frontend with Shadcn UI components, a type-safe TypeScript backend powered by Hono, and persistent data storage using Durable Objects for users, chats, and messages. Perfect for building scalable, real-time chat applications with zero server management.

## Features

- **Full-Stack TypeScript**: End-to-end type safety with shared types between frontend and backend.
- **Durable Objects Entities**: Persistent storage for Users and ChatBoards with built-in indexing and CRUD operations.
- **Modern UI**: Shadcn UI components, Tailwind CSS with custom themes, dark mode, sidebar layout, and animations.
- **API-First Backend**: Hono routes for users, chats, and messages with CORS, logging, and error handling.
- **React Query Integration**: Optimistic updates and caching for seamless data fetching.
- **Cloudflare Native**: Deploy instantly to Cloudflare Workers with Workers Assets for SPA hosting.
- **Developer Experience**: Hot reload, Bun scripts, ESLint, TypeScript strict mode, and error reporting.
- **Responsive Design**: Mobile-first with sidebar collapse and theme toggle.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Router, TanStack Query, Lucide Icons, Sonner (toasts), Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects, Cloudflare SQLite (via DO storage).
- **Tools**: Bun (package manager), Wrangler (CLI), ESLint, TypeScript 5.
- **UI/UX**: Dark/Light themes, Animations (Tailwind Animate), Glassmorphism effects.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`).
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (`npm i -g wrangler` or `bunx wrangler@latest`).
- Cloudflare account with Workers enabled.

### Installation

1. Clone or download the repository.
2. Install dependencies:

```bash
bun install
```

3. Generate Worker types (if needed):

```bash
bun run cf-typegen
```

## Local Development

1. Start the development server:

```bash
bun dev
```

This runs:
- Vite dev server on `http://localhost:3000` (frontend).
- Cloudflare Worker preview on a local tunnel.

2. Open `http://localhost:3000` in your browser.

3. Edit `src/pages/HomePage.tsx` to build your UI, or add routes in `src/main.tsx`.
4. Backend routes are in `worker/user-routes.ts` – extend the example API for users/chats/messages.

Hot reload works for both frontend and Worker code.

## Usage Examples

### Frontend API Calls

Use the provided `api-client.ts`:

```typescript
import { api } from '@/lib/api-client';

// List chats
const { items: chats, next } = await api<{ items: Chat[]; next: string | null }>('/api/chats');

// Create chat
const newChat = await api<Chat>('/api/chats', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Chat' }),
});

// Send message
const message = await api<ChatMessage>('/api/chats/${chatId}/messages', {
  method: 'POST',
  body: JSON.stringify({ userId: 'u1', text: 'Hello!' }),
});
```

### Backend Entities

Extend `worker/entities.ts`:

```typescript
// Example: Custom entity
export class MyEntity extends IndexedEntity<MyState> {
  // Override methods...
}
```

Seed data and indexes are auto-managed.

## Deployment

1. **Login to Cloudflare**:

```bash
wrangler login
```

2. **Deploy** (builds frontend assets and deploys Worker):

```bash
bun run deploy
```

3. Your app is live at `https://${wrangler.jsonc.name}.${your-subdomain}.workers.dev`.

Assets are automatically served as a SPA via Cloudflare Workers Assets.

[cloudflarebutton]

**Pro Tip**: Use `wrangler tail` for real-time logs and `wrangler dev --remote` for remote development.

## Project Structure

```
├── src/                 # React frontend
├── worker/              # Cloudflare Worker backend
├── shared/              # Shared types
├── tailwind.config.js   # UI theming
└── wrangler.jsonc      # Cloudflare config
```

- **Frontend Customization**: Edit `src/pages/`, use Shadcn components via `components.json`.
- **Backend Routes**: Add to `worker/user-routes.ts`.
- **Entities**: Extend in `worker/entities.ts` (do not modify `core-utils.ts`).

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Local dev server |
| `bun build` | Build for production |
| `bun lint` | Lint code |
| `bun preview` | Preview production build |
| `bun run deploy` | Deploy to Cloudflare |
| `bun run cf-typegen` | Update Worker types |

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Commit changes (`bun lint` first).
4. Open a PR.

## License

MIT License. See [LICENSE](LICENSE) for details.