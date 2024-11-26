import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class ReporterService implements OnApplicationBootstrap {
	private static readonly logger = new Logger( ReporterService.name );
	private static metricsService: MetricsService;
	
	constructor( private readonly metrics: MetricsService ) {}
	
	onApplicationBootstrap() {
		ReporterService.metricsService = this.metrics;
	}
	
	static counter( key: string, labels?: Record<string, string | number> ): void {
		try {
			ReporterService.metricsService.incCounter( key, labels );
		} catch ( error ) {
			this.logError( 'increment counter', key, labels, error );
		}
	}
	
	static gauge( key: string, value: number, labels?: Record<string, string | number> ): void {
		try {
			ReporterService.metricsService.setGauge( key, value, labels );
		} catch ( error ) {
			this.logError( 'set gauge', key, labels, error );
		}
	}
	
	static histogram( key: string, value: number, labels?: Record<string, string | number>, buckets?: number[] ): void {
		try {
			ReporterService.metricsService.observeHistogram( key, value, labels, buckets );
		} catch ( error ) {
			this.logError( 'observe histogram', key, labels, error );
		}
	}
	
	static summary( key: string, value: number, labels?: Record<string, string | number>, percentiles?: number[] ): void {
		try {
			ReporterService.metricsService.observeSummary( key, value, labels, percentiles );
		} catch ( error ) {
			this.logError( 'observe summary', key, labels, error );
		}
	}
	
	private static logError( action: string, key: string, labels: Record<string, string | number> | undefined, error: unknown ): void {
		this.logger.error( {
			message: `Failed to ${action}`,
			metric: key,
			labels,
			error: error instanceof Error ? error.message : String( error ),
		} );
	}
}