# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with real-time live preview. Users describe components in natural language through a chat interface, and Claude AI generates functional React components that render immediately in the browser.

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack (localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Run all tests with Vitest
npm run test -- --run  # Run tests once (no watch)
npm run test -- src/lib/__tests__/file-system.test.ts  # Run single test file
npm run db:reset       # Reset database (destructive)
```

## Architecture

### Core Data Flow

1. **Chat Input** → User describes a component in `ChatInterface`
2. **API Route** (`/api/chat/route.ts`) → Streams to Claude with tool definitions
3. **AI Tools** → Claude uses `str_replace_editor` and `file_manager` tools to manipulate files
4. **Virtual File System** → All files exist in memory (`VirtualFileSystem` class), never written to disk
5. **Live Preview** → Files are transpiled with Babel and rendered in an iframe

### Virtual File System (`src/lib/file-system.ts`)

The `VirtualFileSystem` class is central to the application. It:
- Stores files in a `Map<string, FileNode>` structure
- Provides CRUD operations for files/directories
- Serializes to JSON for database persistence
- Exposes editor commands (`viewFile`, `replaceInFile`, `insertInFile`)

### AI Tool Integration

Two tools are exposed to Claude via Vercel AI SDK:

- **str_replace_editor** (`src/lib/tools/str-replace.ts`): view, create, str_replace, insert commands
- **file_manager** (`src/lib/tools/file-manager.ts`): rename, delete operations

Tool calls are intercepted client-side by `FileSystemContext.handleToolCall()` to update the UI in real-time.

### Preview System (`src/lib/transform/jsx-transformer.ts`)

- Transforms JSX/TSX using Babel standalone
- Creates blob URLs for each transformed file
- Generates an import map pointing to esm.sh for third-party packages
- Injects Tailwind CSS via CDN
- Renders in sandboxed iframe with error boundary

### Context Providers

- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`): Manages virtual file system state, handles tool calls
- **ChatContext** (`src/lib/contexts/chat-context.tsx`): Manages chat messages and AI streaming

### Database (Prisma + SQLite)

Models in `prisma/schema.prisma`:
- **User**: email, hashed password
- **Project**: name, serialized messages (JSON), serialized file system data (JSON)

Prisma client is generated to `src/generated/prisma`.

### Authentication

JWT-based auth using `jose` library. Sessions stored in cookies with 7-day expiration. See `src/lib/auth.ts`.

## Key Patterns

- **Mock Provider**: Without `ANTHROPIC_API_KEY`, the app uses a mock provider that returns static component code
- **Tool Streaming**: AI responses stream to the client; tool calls update the file system as they arrive
- **Automatic Parent Creation**: Creating a file automatically creates parent directories
- **Entry Point Detection**: Preview looks for `/App.jsx`, `/index.jsx`, or first root-level file

## Environment Variables

```
ANTHROPIC_API_KEY=...  # Optional - enables real AI generation
JWT_SECRET=...         # Auto-generated if not set
```
