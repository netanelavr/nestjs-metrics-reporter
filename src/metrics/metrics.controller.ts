import { Controller, Get } from '@nestjs/common';
import { Registry } from 'prom-client';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags( 'Metrics' )
@Controller( 'metrics' )
export class MetricsController {
	constructor( private readonly registry: Registry ) {}
	
	@Get()
	@ApiOperation( { summary: 'Get Prometheus metrics' } )
	@ApiOkResponse( { type: Object } )
	async getMetrics(): Promise<string> {
		return await this.registry.metrics();
	}
}