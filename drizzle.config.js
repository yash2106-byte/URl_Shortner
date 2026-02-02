// Add to top of drizzle.config.js
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './Models/index.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
