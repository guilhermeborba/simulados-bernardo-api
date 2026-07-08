import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'simulados-bernardo-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReadiness() {
    const database = await this.healthService.checkDatabase();

    if (!database.ok) {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        checks: {
          database: 'down',
        },
      });
    }

    return {
      status: 'ready',
      checks: {
        database: 'up',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
