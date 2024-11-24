import { Controller, Get } from '@nestjs/common';
import { Registry } from 'prom-client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags( 'Metrics' )
@Controller( 'metrics' )
export class MetricsController {
	constructor( private readonly registry: Registry ) {
	}
     
     @Get()
	async getMetrics() {
		return await this.registry.metrics();
	}
}