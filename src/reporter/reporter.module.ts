import { DynamicModule, Global, Module } from '@nestjs/common';
import { ReporterService } from './reporter.service';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { MetricsConfig } from '../interfaces';
import { MetricsService } from '../metrics/metrics.service';
import { MetricsController } from '../metrics/metrics.controller';

@Global()
@Module( {} )
export class ReporterModule {
	static forRoot( config: MetricsConfig = {} ): DynamicModule {
		const registry = new Registry();
          
		if ( config.defaultLabels ) {
			registry.setDefaultLabels( config.defaultLabels );
		}
          
		if ( config.defaultMetricsEnabled !== false ) {
			collectDefaultMetrics( { register: registry } );
		}
          
		return {
			module: ReporterModule,
			providers: [
				{
					provide: Registry,
					useValue: registry
				},
				MetricsService,
				ReporterService
			],
			controllers: [ MetricsController ],
			exports: [ ReporterService ]
		};
	}
     
	static forRootAsync( options: {
          imports?: any[];
          useFactory: ( ...args: any[] ) => Promise<MetricsConfig> | MetricsConfig;
          inject?: any[];
     } ): DynamicModule {
		return {
			module: ReporterModule,
			imports: options.imports,
			providers: [
				{
					provide: 'CONFIG_OPTIONS',
					useFactory: options.useFactory,
					inject: options.inject,
				},
				{
					provide: Registry,
					useFactory: async ( config: MetricsConfig ) => {
						const registry = new Registry();
                              
						if ( config.defaultLabels ) {
							registry.setDefaultLabels( config.defaultLabels );
						}
                              
						if ( config.defaultMetricsEnabled !== false ) {
							collectDefaultMetrics( { register: registry } );
						}
                              
						return registry;
					},
					inject: [ 'CONFIG_OPTIONS' ],
				},
				MetricsService,
				ReporterService
			],
			controllers: [ MetricsController ],
			exports: [ ReporterService ]
		};
	}
}