import { DynamicModule, Global, Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module';
import { ReporterOptions } from '../interfaces';

@Global()
@Module( {} )
export class ReporterModule {
	static forRoot( options: ReporterOptions = {} ): DynamicModule {
		return {
			module: ReporterModule,
			imports: [ MetricsModule.forRoot() ],
			providers: [
				{
					provide: 'REPORTER_OPTIONS',
					useValue: {
						logErrors: true,
						defaultLabels: {},
						...options,
					},
				},
			],
			exports: [],
			global: true,
		};
	}
     
	static forRootAsync( options: {
          imports?: any[];
          useFactory: ( ...args: any[] ) => Promise<ReporterOptions> | ReporterOptions;
          inject?: any[];
     } ): DynamicModule {
		return {
			module: ReporterModule,
			imports: [ ...( options.imports || [] ), MetricsModule.forRoot() ],
			providers: [
				{
					provide: 'REPORTER_OPTIONS',
					useFactory: options.useFactory,
					inject: options.inject || [],
				},
			],
			exports: [],
			global: true,
		};
	}
}