import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';
import { ReporterOptions } from '../interfaces';


@Injectable()
export class ReporterService {
	private static readonly logger = new Logger( ReporterService.name );
	private static metricsService: MetricsService;
	private static options: ReporterOptions;
     
	static init( metricsService: MetricsService, @Optional() @Inject( 'REPORTER_OPTIONS' ) options: ReporterOptions = {} ): void {
		ReporterService.metricsService = metricsService;
		ReporterService.options = {
			logErrors: true,
			defaultLabels: {},
			...options,
		};
	}
     
	static counter( key: string, labels: Record<string, string | number> = {} ): void {
		try {
			const finalLabels = {
				...this.options?.defaultLabels,
				...labels,
			};
			ReporterService.metricsService.incCounter( key, finalLabels );
		} catch ( e ) {
			if ( this.options?.logErrors ) {
				this.logger.error( `Error while incrementing counter - ${ key }`, e );
			}
		}
	}
     
	static gauge( key: string, value: number, labels: Record<string, string | number> = {} ): void {
		try {
			const finalLabels = {
				...this.options?.defaultLabels,
				...labels,
			};
			ReporterService.metricsService.setGauge( key, value, finalLabels );
		} catch ( e ) {
			if ( this.options?.logErrors ) {
				this.logger.error( `Error while setting gauge - ${ key }, ${ value }`, e );
			}
		}
	}
     
	static hasBeenInitialized(): boolean {
		return !! ReporterService.metricsService;
	}
}