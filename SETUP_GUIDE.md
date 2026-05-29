# Developer Setup Guide: Cosmediq SaaS Platform

This document describes the environment setup, local database initialization, data seeding, and compilation workflows required to run and test the Cosmediq SaaS codebase locally.

---

## 1. Prerequisites and Installation

Ensure Node.js (version 20 or higher) and npm are installed on your local system.

### Install Dependencies
Execute the standard package installations:
```bash
npm install
```

The system relies on the following key dependencies:
* **Next.js 16.2.6** (React 19.2.4 integration)
* **Prisma 7.8.0** (Database ORM schema management)
* **NextAuth v5 Beta** (Secure role-based RBAC session control)
* **node-postgres (pg)** (Native driver pool connection)
* **Recharts** (Interactive administrative dashboard analytics)

---

## 2. Database Engine Setup

Cosmediq utilizes PostgreSQL for core data storage. For local sandbox development, the environment leverages the local Prisma Postgres engine.

### Start the Local Database Engine
Run the development engine in the background:
```bash
npx prisma dev
```
Upon startup, the command initializes the local database container and generates the necessary PostgreSQL connection ports.

### Port Mapping
* **Direct Database Port:** `51214` (Exposed standard PostgreSQL protocol)
* **Shadow Database Port:** `51215` (Used for migrations)
* **Prisma Accelerate Port:** `51213` (API key proxy routing)

The `.env` file must configure `DATABASE_URL` matching the API key block provided by the `prisma dev` server.

---

## 3. Database Schema and Seeding

Our system uses custom PostgreSQL adapters to bridge Prisma models with standard database pools.

### Push the Database Schema
Ensure the latest database schema is active:
```bash
npx prisma db push
```

### Run the High-Fidelity Seeder
Populate the database with clinical demo data (specialist queues, multi-visit clinical journeys, invoices, and system audit trails):
```bash
npx tsx prisma/seed.ts
```

*Note: The seeder utilizes a built-in `.env` parser that automatically extracts and decodes the direct `postgres://` port connection string from the Prisma API key search parameters, preventing `ECONNREFUSED` connection issues.*

---

## 4. Development and Compilation

### Start Next.js Development Server
Start the client application locally:
```bash
npm run dev
```
The application will listen on [http://localhost:3000](http://localhost:3000).

### Execute Production Build
Verify strict static analysis, TypeScript, and compilation compliance before staging releases:
```bash
npm run build
```
The command builds the optimized client static bundle and validates compiled pages against pre-seeded server-side dynamic paths.
