import { Controller, Get } from '@nestjs/common';

import { DatabaseService } from './database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getHealth() {
    const dbOk = await this.db.ping();

    return {
      status: 'ok',
      db: dbOk,
    };
  }
}
