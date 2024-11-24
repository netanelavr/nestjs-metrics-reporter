import { Logger } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';

export class ReporterService {
	private static readonly logger = new Logger( ReporterService.name );
	private static metricsService: MetricsService;
	
	static init( metricsService: MetricsService ): void {
		ReporterService.metricsService = metricsService;
	}
	
	static counter(
		key: string,
		labels?: Record<string, string | number>
	): void {
		this.validateMetricsService();
		
		try {
			ReporterService.metricsService.incCounter( key, labels );
		} catch ( error ) {
			this.logger.error( `Error while incrementing counter - ${ key }`, error );
		}
	}
	
	static gauge(
		key: string,
		value: number,
		labels?: Record<string, string | number>
	): void {
		this.validateMetricsService();
		
		try {
			ReporterService.metricsService.setGauge( key, value, labels );
		} catch ( error ) {
			this.logger.error( `Error while setting gauge - ${ key }, ${ value }`, error );
		}
	}
	
	static histogram(
		key: string,
		value: number,
		labels?: Record<string, string | number>,
		buckets?: number[]
	): void {
		this.validateMetricsService();
		
		try {
			ReporterService.metricsService.observeHistogram( key, value, labels, buckets );
		} catch ( error ) {
			this.logger.error( `Error while observing histogram - ${ key }, ${ value }`, error );
		}
	}
	
	static summary(
		key: string,
		value: number,
		labels?: Record<string, string | number>,
		percentiles?: number[]
	): void {
		this.validateMetricsService();
		
		try {
			ReporterService.metricsService.observeSummary( key, value, labels, percentiles );
		} catch ( error ) {
			this.logger.error( `Error while observing summary - ${ key }, ${ value }`, error );
		}
	}
	
	private static validateMetricsService(): void {
		if ( ! ReporterService.metricsService ) {
			throw new Error( 'MetricsService is not initialized.' );
		}
	}
}