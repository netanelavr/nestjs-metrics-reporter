import { Test, TestingModule } from '@nestjs/testing';
import { ReporterService } from '../src';
import { MetricsService } from '../src';
import { Registry } from 'prom-client';
import { Logger } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../src/constants';

describe( 'ReporterService', () => {
	let registry: Registry;
	let loggerSpy: jest.SpyInstance;
	let reporterService: ReporterService;
	let metricsService: MetricsService;
	let pushMetricsSpy: jest.SpyInstance;
	
	beforeEach( async () => {
		registry = new Registry();
		const module: TestingModule = await Test.createTestingModule( {
			providers: [
				MetricsService,
				ReporterService,
				{
					provide: Registry,
					useValue: registry,
				},
				{
					provide: CONFIG_OPTIONS,
					useValue: {
						pushgatewayUrl: 'http://localhost:9091',
						pushgatewayOptions: {}
					}
				}
			],
		} ).compile();
		
		reporterService = module.get<ReporterService>( ReporterService );
		metricsService = module.get<MetricsService>( MetricsService );
		
		reporterService.onApplicationBootstrap();
		
		loggerSpy = jest.spyOn( Logger.prototype, 'error' );
		pushMetricsSpy = jest.spyOn( metricsService, 'pushMetrics' );
	} );
	
	afterEach( () => {
		registry.clear();
		jest.clearAllMocks();
		( ReporterService as any ).metricsService = undefined;
	} );
	
	describe( 'counter', () => {
		it( 'should increment counter through static method', async () => {
			ReporterService.counter( 'test_counter', { method: 'POST' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_counter{method="POST"} 1' );
		} );
		
		it( 'should handle errors gracefully', () => {
			ReporterService.counter( undefined as any, {} );
			
			expect( loggerSpy ).toHaveBeenCalledWith( {
				message: 'Failed to increment counter',
				metric: undefined,
				labels: {},
				error: 'Missing mandatory name parameter',
			} );
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
			expect( loggerSpy ).toHaveBeenCalledWith( {
				message: 'Failed to set gauge',
				metric: undefined,
				labels: {},
				error: 'Missing mandatory name parameter',
			} );
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
			expect( loggerSpy ).toHaveBeenCalledWith( {
				message: 'Failed to observe histogram',
				metric: undefined,
				labels: {},
				error: 'Missing mandatory name parameter',
			} );
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
			ReporterService.histogram( 'test_histogram', 0.5, {}, [0.1, 0.5, 1.0] );
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
			expect( loggerSpy ).toHaveBeenCalledWith( {
				message: 'Failed to observe summary',
				metric: undefined,
				labels: {},
				error: 'Missing mandatory name parameter',
			} );
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
			ReporterService.summary( 'test_summary', 100, {}, [0.5, 0.9] );
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
	
	describe( 'pushMetrics', () => {
		it( 'should successfully push metrics', async () => {
			pushMetricsSpy.mockResolvedValue( { status: 200, success: true } );
			
			await ReporterService.pushMetrics( 'test-job' );
			
			expect( pushMetricsSpy ).toHaveBeenCalledWith( 'test-job' );
			expect( loggerSpy ).not.toHaveBeenCalled();
		} );
		
		it( 'should handle pushMetrics failure', async () => {
			const error = new Error( 'Push failed' );
			pushMetricsSpy.mockRejectedValue( error );
			
			await ReporterService.pushMetrics( 'test-job' );
			
			expect( pushMetricsSpy ).toHaveBeenCalledWith( 'test-job' );
			expect( loggerSpy ).toHaveBeenCalledWith( 'Error pushing metrics: Error: Push failed' );
		} );
		
		it( 'should handle pushgateway not configured', async () => {
			const moduleWithoutPushgateway: TestingModule = await Test.createTestingModule( {
				providers: [
					MetricsService,
					ReporterService,
					{
						provide: Registry,
						useValue: registry,
					},
					{
						provide: CONFIG_OPTIONS,
						useValue: {}
					}
				],
			} ).compile();
			
			const newReporterService = moduleWithoutPushgateway.get<ReporterService>( ReporterService );
			const newMetricsService = moduleWithoutPushgateway.get<MetricsService>( MetricsService );
			newReporterService.onApplicationBootstrap();
			
			const newPushMetricsSpy = jest.spyOn( newMetricsService, 'pushMetrics' );
			newPushMetricsSpy.mockResolvedValue( {
				status: 400,
				success: false,
				message: 'Pushgateway is not configured'
			} );
			
			( ReporterService as any ).metricsService = newMetricsService;
			
			await ReporterService.pushMetrics( 'test-job' );
			
			expect( newPushMetricsSpy ).toHaveBeenCalledWith( 'test-job' );
			expect( loggerSpy ).not.toHaveBeenCalled();
		} );
		
		it( 'should handle non-Error objects in error message', async () => {
			const nonErrorObject = 'String error message';
			pushMetricsSpy.mockRejectedValue( nonErrorObject );
			
			await ReporterService.pushMetrics( 'test-job' );
			
			expect( pushMetricsSpy ).toHaveBeenCalledWith( 'test-job' );
			expect( loggerSpy ).toHaveBeenCalledWith( 'Error pushing metrics: String error message' );
		} );
	} );
} );
