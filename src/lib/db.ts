import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const getDirectPostgresUrl = (url: string | undefined): string => {
  const defaultUrl = 'postgresql://postgres:password@localhost:5432/cosmediq?schema=public';
  if (!url) return defaultUrl;
  if (url.startsWith('prisma+postgres://')) {
    try {
      const urlObj = new URL(url);
      const apiKey = urlObj.searchParams.get('api_key');
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf-8'));
        if (decoded && decoded.databaseUrl) {
          console.log('🔌 [Prisma Adapter] Decoded direct postgres URL from API key.');
          return decoded.databaseUrl;
        }
      }
    } catch (e) {
      console.error('❌ Failed to decode prisma+postgres DATABASE_URL:', e);
    }
  }
  return url;
};

const prismaClientSingleton = () => {
  const rawUrl = process.env.DATABASE_URL;
  const connectionString = getDirectPostgresUrl(rawUrl);
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db;
}

