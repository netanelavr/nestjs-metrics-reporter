import { Test, TestingModule } from '@nestjs/testing';
import { ReporterService } from '../src/reporter/reporter.service';
import { MetricsService } from '../src/metrics/metrics.service';
import { Registry } from 'prom-client';
import { Logger } from '@nestjs/common';

describe( 'ReporterService', () => {
	let metricsService: MetricsService;
	let registry: Registry;
	let loggerSpy: jest.SpyInstance;
	
	beforeEach( async () => {
		registry = new Registry();
		const module: TestingModule = await Test.createTestingModule( {
			providers: [
				MetricsService,
				{
					provide: Registry,
					useValue: registry,
				},
			],
		} ).compile();
		
		metricsService = module.get<MetricsService>( MetricsService );
		ReporterService.init( metricsService );
		loggerSpy = jest.spyOn( Logger.prototype, 'error' );
	} );
	
	afterEach( () => {
		registry.clear();
		jest.clearAllMocks();
	} );
	
	describe( 'counter', () => {
		it( 'should increment counter through static method', async () => {
			ReporterService.counter( 'test_counter', { method: 'POST' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_counter{method="POST"} 1' );
		} );
		
		it( 'should handle errors gracefully', () => {
			ReporterService.counter( undefined as any, {} );
			expect( loggerSpy ).toHaveBeenCalledWith(
				'Error while incrementing counter - undefined',
				expect.any( Error )
			);
		} );
		
		it( 'should work without labels', async () => {
			ReporterService.counter( 'test_counter' );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_counter 1' );
		} );
	} );
	
	describe( 'gauge', () => {
		it( 'should set gauge through static method', async () => {
			ReporterService.gauge( 'test_gauge', 42, { region: 'eu' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_gauge{region="eu"} 42' );
		} );
		
		it( 'should handle errors gracefully', () => {
			ReporterService.gauge( undefined as any, 42, {} );
			expect( loggerSpy ).toHaveBeenCalledWith(
				'Error while setting gauge - undefined, 42',
				expect.any( Error )
			);
		} );
		
		it( 'should work without labels', async () => {
			ReporterService.gauge( 'test_gauge', 42 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_gauge 42' );
		} );
	} );
	
	describe( 'histogram', () => {
		it( 'should observe histogram through static method', async () => {
			ReporterService.histogram( 'test_histogram', 0.5, { path: '/api' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_histogram Histogram for test_histogram' );
			expect( metrics ).toContain( '# TYPE test_histogram histogram' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.5",path="/api"} 1' );
			expect( metrics ).toContain( 'test_histogram_sum{path="/api"} 0.5' );
			expect( metrics ).toContain( 'test_histogram_count{path="/api"} 1' );
		} );
		
		it( 'should handle errors gracefully', () => {
			ReporterService.histogram( undefined as any, 0.5, {} );
			expect( loggerSpy ).toHaveBeenCalledWith(
				'Error while observing histogram - undefined, 0.5',
				expect.any( Error )
			);
		} );
		
		it( 'should work without labels', async () => {
			ReporterService.histogram( 'test_histogram', 0.5 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_histogram Histogram for test_histogram' );
			expect( metrics ).toContain( '# TYPE test_histogram histogram' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.5"} 1' );
			expect( metrics ).toContain( 'test_histogram_sum 0.5' );
			expect( metrics ).toContain( 'test_histogram_count 1' );
		} );
		
		it( 'should work with custom buckets', async () => {
			ReporterService.histogram( 'test_histogram', 0.5, {}, [ 0.1, 0.5, 1.0 ] );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.1"} 0' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.5"} 1' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="1"} 1' );
			expect( metrics ).toContain( 'test_histogram_sum 0.5' );
			expect( metrics ).toContain( 'test_histogram_count 1' );
		} );
	} );
	
	describe( 'summary', () => {
		it( 'should observe summary through static method', async () => {
			ReporterService.summary( 'test_summary', 100, { endpoint: '/users' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary_sum{endpoint="/users"} 100' );
			expect( metrics ).toContain( 'test_summary_count{endpoint="/users"} 1' );
		} );
		
		it( 'should handle errors gracefully', () => {
			ReporterService.summary( undefined as any, 100, {} );
			expect( loggerSpy ).toHaveBeenCalledWith(
				'Error while observing summary - undefined, 100',
				expect.any( Error )
			);
		} );
		
		it( 'should work without labels', async () => {
			ReporterService.summary( 'test_summary', 100 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary_sum 100' );
			expect( metrics ).toContain( 'test_summary_count 1' );
		} );
		
		it( 'should work with custom percentiles', async () => {
			ReporterService.summary( 'test_summary', 100, {}, [ 0.5, 0.9 ] );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary{quantile="0.5"}' );
			expect( metrics ).toContain( 'test_summary{quantile="0.9"}' );
			expect( metrics ).toContain( 'test_summary_sum 100' );
			expect( metrics ).toContain( 'test_summary_count 1' );
		} );
		
		it( 'should handle multiple observations', async () => {
			ReporterService.summary( 'test_summary', 100 );
			ReporterService.summary( 'test_summary', 200 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_summary_sum 300' );
			expect( metrics ).toContain( 'test_summary_count 2' );
		} );
		
		it( 'should handle multiple observations with labels', async () => {
			ReporterService.summary( 'test_summary', 100, { endpoint: '/api' } );
			ReporterService.summary( 'test_summary', 200, { endpoint: '/api' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_summary_sum{endpoint="/api"} 300' );
			expect( metrics ).toContain( 'test_summary_count{endpoint="/api"} 2' );
		} );
	} );
	
	describe( 'initialization', () => {
		it( 'should throw error if used before initialization', () => {
			( ReporterService as any ).metricsService = undefined;
			
			expect( () => {
				ReporterService.counter( 'test_counter' );
			} ).toThrow();
		} );
	} );
} );