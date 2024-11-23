import { DynamicModule, Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { PrometheusOptions } from '../interfaces';


@Module( {} )
export class MetricsModule {
	static forRoot( options: PrometheusOptions = {} ): DynamicModule {
		const {
			defaultMetricsEnabled = true,
			defaultLabels = {},
		} = options;
          
		const registry = new Registry();
		registry.setDefaultLabels( defaultLabels );
          
		if ( defaultMetricsEnabled ) {
			collectDefaultMetrics( { register: registry } );
		}
          
		return {
			module: MetricsModule,
			providers: [
				{
					provide: Registry,
					useValue: registry,
				},
				MetricsService,
			],
			exports: [ Registry, MetricsService ],
			controllers: [ MetricsController ],
			global: true,
		};
	}
}
