import { Inject, Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, Summary } from 'prom-client';

@Injectable()
export class MetricsService {
	private readonly counter: { [ key: string ]: Counter<string> } = {};
	private readonly gauge: { [ key: string ]: Gauge<string> } = {};
	private readonly histogram: { [ key: string ]: Histogram<string> } = {};
	private readonly summary: { [ key: string ]: Summary<string> } = {};
	
	constructor( @Inject( Registry ) private readonly registry: Registry ) {}
	
	public incCounter( key: string, labels?: Record<string, string | number> ): void {
		if ( ! this.counter[ key ] ) {
			this.counter[ key ] = new Counter( {
				name: key,
				help: `Counter for ${ key }`,
				labelNames: labels ? Object.keys( labels ) : [],
				registers: [ this.registry ],
			} );
		}
		this.counter[ key ].inc( labels || {} );
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
}