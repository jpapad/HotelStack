import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';

loadEnv({
  path: join(process.cwd(), '..', '..', '.env'),
  override: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
