import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool({
      host: this.config.get<string>('DB_HOST') ?? 'localhost',
      port: Number(this.config.get<string>('DB_PORT') ?? 5432),
      user: this.config.get<string>('DB_USER') ?? 'postgres',
      password: this.config.get<string>('DB_PASSWORD') ?? 'postgres',
      database: this.config.get<string>('DB_NAME') ?? 'app',
    });
  }

  async ping(): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
