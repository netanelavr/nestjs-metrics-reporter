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
	
	static counter(key: string, labels?: Record<string, string | number>): void {
		try {
			ReporterService.metricsService.incCounter( key, labels );
		} catch ( error ) {
			this.logger.error( `Error while incrementing counter - ${ key }`, error );
		}
	}
	
	static gauge(key: string, value: number, labels?: Record<string, string | number>): void {
		try {
			ReporterService.metricsService.setGauge( key, value, labels );
		} catch ( error ) {
			this.logger.error( `Error while setting gauge - ${ key }, ${ value }`, error );
		}
	}
	
	static histogram(key: string, value: number, labels?: Record<string, string | number>, buckets?: number[]): void {
		try {
			ReporterService.metricsService.observeHistogram( key, value, labels, buckets );
		} catch ( error ) {
			this.logger.error( `Error while observing histogram - ${ key }, ${ value }`, error );
		}
	}
	
	static summary(key: string, value: number, labels?: Record<string, string | number>, percentiles?: number[]): void {
		try {
			ReporterService.metricsService.observeSummary( key, value, labels, percentiles );
		} catch ( error ) {
			this.logger.error( `Error while observing summary - ${ key }, ${ value }`, error );
		}
	}
}