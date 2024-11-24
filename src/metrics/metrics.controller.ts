import { Controller, Get } from '@nestjs/common';
import { Registry } from 'prom-client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags( 'Metrics' )
@Controller( 'metrics' )
export class MetricsController {
	constructor( private readonly registry: Registry ) {}
	
	@Get()
	@ApiOperation( { summary: 'Get Prometheus metrics' } )
	async getMetrics(): Promise<string> {
		return await this.registry.metrics();
	}
}