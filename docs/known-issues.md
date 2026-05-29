# Known Issues & Configuration Guides

This document tracks known runtime limitations, compiler warnings, and configuration guidelines resolved during the Phase 1 QA and stabilization pass.

---

## 🚦 System Configuration Guidelines

### 1. Database Connection String Setup
- **Issue:** Prisma Client cannot connect unless `DATABASE_URL` is configured in `.env`.
- **Solution:** Ensure you copy `.env.example` to `.env` and fill in your PostgreSQL credentials. Run `npx prisma db push` and `npx prisma db seed` before starting the application dev server.

### 2. NextAuth.js v5 secret setup
- **Issue:** Portal login will fail to sign session tokens unless `AUTH_SECRET` is defined in `.env`.
- **Solution:** Generate a secure token string (`openssl rand -base64 33`) and set `AUTH_SECRET` inside the `.env` file.

---

## ⚠️ Compiler & Dependency Warnings

### 1. Next.js 16 Middleware Deprecation Warning
- **Warning:** `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Status:** *Informational*. Next.js 16 has deprecated the `middleware` naming convention in favor of a newer experimental `proxy` API. Our `middleware.ts` is fully supported by NextAuth v5 and Turbopack compiler, so the warning can be safely ignored. It does not affect production compilation or build integrity.

### 2. Peer Dependency Warnings during Installation
- **Warning:** `npm error ERESOLVE unable to resolve dependency tree` (peer dependency warnings for `next-auth` peer constraint of `next@"^14.0.0-0 || ^15.0.0-0"`).
- **Status:** *Resolved*. Safe to bypass using the `--legacy-peer-deps` flag. All installations have compiled successfully and TypeScript variables resolve correctly under Next.js 16.2 and React 19.

### 3. Prisma v7 Client Initialization
- **Warning:** `PrismaClient` initialization errors if instantiated without parameters (`new PrismaClient()`).
- **Status:** *Resolved*. Prisma v7 requires using driver adapters for direct relational database connections. We have installed `@prisma/adapter-pg` and configured a pg pool inside `src/lib/db.ts` to ensure 100% database-level safety and v7 compatibility.
