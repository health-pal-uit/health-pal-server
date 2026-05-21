import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Response } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

// collect Node.js default metrics: CPU, memory, event loop, GC
collectDefaultMetrics({ prefix: 'nodejs_' });

@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiExcludeEndpoint()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}
