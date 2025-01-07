import { Inject, Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Pushgateway, Registry, Summary } from 'prom-client';
import { MetricsConfig, PushgatewayResponse } from '../interfaces';
import { CONFIG_OPTIONS } from '../constants';

@Injectable()
export class MetricsService {
	private readonly counter: Record<string, Counter<string>> = {};
	private readonly gauge: Record<string, Gauge<string>> = {};
	private readonly histogram: Record<string, Histogram<string>> = {};
	private readonly summary: Record<string, Summary<string>> = {};
	private readonly pushgateway: Pushgateway;
	
	
	constructor(
          @Inject( Registry ) private readonly registry: Registry,
          @Inject( CONFIG_OPTIONS ) private readonly config: MetricsConfig
	) {
		if ( this.config.pushgatewayUrl ) {
			this.pushgateway = new Pushgateway(
				this.config.pushgatewayUrl,
				this.config.pushgatewayOptions || [],
				this.registry,
			);
		}
	}
     
	public incCounter( key: string, labels?: Record<string, string | number>, value: number = 1 ): void {
		if ( ! this.counter[ key ] ) {
			this.counter[ key ] = new Counter( {
				name: key,
				help: `Counter for ${ key }`,
				labelNames: labels ? Object.keys( labels ) : [],
				registers: [ this.registry ],
			} );
		}
		this.counter[ key ].inc( labels || {}, value );
	}
     
	public setGauge( key: string, value: number, labels?: Record<string, string | number> ): void {
		if ( ! this.gauge[ key ] ) {
			this.gauge[ key ] = new Gauge( {
				name: key,
				help: `Gauge for ${ key }`,
				labelNames: labels ? Object.keys( labels ) : [],
				registers: [ this.registry ],
			} );
		}
		this.gauge[ key ].set( labels || {}, value );
	}
     
	public observeHistogram(
		key: string,
		value: number,
		labels?: Record<string, string | number>,
		buckets?: number[]
	): void {
		if ( ! this.histogram[ key ] ) {
			this.histogram[ key ] = new Histogram( {
				name: key,
				help: `Histogram for ${ key }`,
				labelNames: labels ? Object.keys( labels ) : [],
				buckets: buckets || [ 0.1, 0.5, 1, 2, 5 ],
				registers: [ this.registry ],
			} );
		}
		this.histogram[ key ].observe( labels || {}, value );
	}
     
	public observeSummary(
		key: string,
		value: number,
		labels?: Record<string, string | number>,
		percentiles?: number[]
	): void {
		if ( ! this.summary[ key ] ) {
			this.summary[ key ] = new Summary( {
				name: key,
				help: `Summary for ${ key }`,
				labelNames: labels ? Object.keys( labels ) : [],
				percentiles: percentiles || [ 0.01, 0.05, 0.5, 0.9, 0.95, 0.99 ],
				registers: [ this.registry ],
			} );
		}
		this.summary[ key ].observe( labels || {}, value );
	}
     
	public async pushMetrics( jobName: string ): Promise<PushgatewayResponse> {
		if ( !this.pushgateway ) {
			return {
				status: 400,
				success: false,
				message: 'Pushgateway is not configured'
			};
		}

		try {
			await this.pushgateway.pushAdd( { jobName } );
			return { status: 200, success: true };
		} catch ( error ) {
			return {
				status: 500,
				success: false,
				message: error instanceof Error ? error.message : String( error )
			};
		}
	}
}