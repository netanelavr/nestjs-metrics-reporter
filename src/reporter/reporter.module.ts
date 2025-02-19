import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ReporterService } from './reporter.service';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { MetricsConfig, ReporterAsyncOptions } from '../interfaces';
import { MetricsService } from '../metrics/metrics.service';
import { MetricsController } from '../metrics/metrics.controller';
import { CONFIG_OPTIONS } from '../constants';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module( {} )
export class ReporterModule {
	static forRoot( config: MetricsConfig = {} ): DynamicModule {
		const registry: Registry = this.configureRegistry( config );
		const providers: Provider[] = [
			{
				provide: Registry,
				useValue: registry
			},
			{
				provide: CONFIG_OPTIONS,
				useValue: config
			},
			MetricsService,
			ReporterService
		];
		
		if ( config.interceptors ) {
			providers.push( ...config.interceptors.map( interceptor => ( {
				provide: APP_INTERCEPTOR,
				useClass: interceptor as Type<any>,
			} ) ) );
		}
		return {
			module: ReporterModule,
			providers,
			controllers: [ MetricsController ],
			exports: [ ReporterService ]
		};
	}
 
	static forRootAsync( options: ReporterAsyncOptions ): DynamicModule {
		return {
			module: ReporterModule,
			imports: options.imports,
			providers: [
				{
					provide: CONFIG_OPTIONS,
					useFactory: options.useFactory,
					inject: options.inject,
				},
				{
					provide: Registry,
					useFactory: async ( config: MetricsConfig ) => {
						return ReporterModule.configureRegistry( config );
					},
					inject: [ CONFIG_OPTIONS ],
				},
				MetricsService,
				ReporterService
			],
			controllers: [ MetricsController ],
			exports: [ ReporterService ]
		};
	}
     
	private static configureRegistry( config: MetricsConfig = {} ): Registry {
		const registry: Registry = new Registry();
          
		if ( config.defaultLabels ) {
			registry.setDefaultLabels( config.defaultLabels );
		}
          
		if ( config.defaultMetricsEnabled ) {
			collectDefaultMetrics( { register: registry } );
		}
          
		return registry;
	}
}