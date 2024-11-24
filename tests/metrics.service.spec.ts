import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from '../src';
import { Registry } from 'prom-client';

describe( 'MetricsService', () => {
	let service: MetricsService;
	let registry: Registry;
	
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
		
		service = module.get<MetricsService>( MetricsService );
	} );
	
	afterEach( () => {
		registry.clear();
	} );
	
	describe( 'incCounter', () => {
		it( 'should create and increment counter without labels', async () => {
			service.incCounter( 'test_counter' );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_counter Counter for test_counter' );
			expect( metrics ).toContain( '# TYPE test_counter counter' );
			expect( metrics ).toContain( 'test_counter 1' );
		} );
		
		it( 'should create and increment counter with labels', async () => {
			service.incCounter( 'test_counter', { method: 'GET' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_counter Counter for test_counter' );
			expect( metrics ).toContain( '# TYPE test_counter counter' );
			expect( metrics ).toContain( 'test_counter{method="GET"} 1' );
		} );
		
		it( 'should increment existing counter', async () => {
			service.incCounter( 'test_counter' );
			service.incCounter( 'test_counter' );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_counter Counter for test_counter' );
			expect( metrics ).toContain( '# TYPE test_counter counter' );
			expect( metrics ).toContain( 'test_counter 2' );
		} );
		
		it( 'should handle invalid labels', () => {
			expect( () => {
				service.incCounter( 'test_counter', { '': 'invalid' } );
			} ).toThrow();
		} );
	} );
	
	describe( 'setGauge', () => {
		it( 'should create and set gauge', async () => {
			service.setGauge( 'test_gauge', 42 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_gauge Gauge for test_gauge' );
			expect( metrics ).toContain( '# TYPE test_gauge gauge' );
			expect( metrics ).toContain( 'test_gauge 42' );
		} );
		
		it( 'should create and set gauge with labels', async () => {
			service.setGauge( 'test_gauge', 42, { region: 'us' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_gauge Gauge for test_gauge' );
			expect( metrics ).toContain( '# TYPE test_gauge gauge' );
			expect( metrics ).toContain( 'test_gauge{region="us"} 42' );
		} );
		
		it( 'should update existing gauge value', async () => {
			service.setGauge( 'test_gauge', 42 );
			service.setGauge( 'test_gauge', 84 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_gauge Gauge for test_gauge' );
			expect( metrics ).toContain( '# TYPE test_gauge gauge' );
			expect( metrics ).toContain( 'test_gauge 84' );
		} );
		
		it( 'should handle negative values', async () => {
			service.setGauge( 'test_gauge', -42 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_gauge Gauge for test_gauge' );
			expect( metrics ).toContain( '# TYPE test_gauge gauge' );
			expect( metrics ).toContain( 'test_gauge -42' );
		} );
	} );
	
	describe( 'observeHistogram', () => {
		it( 'should create and observe histogram without labels', async () => {
			service.observeHistogram( 'test_histogram', 0.5 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_histogram Histogram for test_histogram' );
			expect( metrics ).toContain( '# TYPE test_histogram histogram' );
			expect( metrics ).toContain( 'test_histogram_sum 0.5' );
			expect( metrics ).toContain( 'test_histogram_count 1' );
		} );
		
		it( 'should create and observe histogram with labels', async () => {
			service.observeHistogram( 'test_histogram', 0.5, { method: 'GET' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_histogram Histogram for test_histogram' );
			expect( metrics ).toContain( '# TYPE test_histogram histogram' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.1",method="GET"} 0' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.5",method="GET"} 1' );
			expect( metrics ).toContain( 'test_histogram_sum{method="GET"} 0.5' );
			expect( metrics ).toContain( 'test_histogram_count{method="GET"} 1' );
		} );
		
		it( 'should create histogram with custom buckets', async () => {
			service.observeHistogram( 'test_histogram', 0.5, {}, [ 0.1, 0.3, 0.5, 1.0 ] );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.1"} 0' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.3"} 0' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.5"} 1' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="1"} 1' );
			expect( metrics ).toContain( 'test_histogram_count 1' );
		} );
		
		it( 'should handle multiple observations', async () => {
			service.observeHistogram( 'test_histogram', 0.2 );
			service.observeHistogram( 'test_histogram', 0.4 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_histogram_sum 0.6' );
			expect( metrics ).toContain( 'test_histogram_count 2' );
		} );
		
		it( 'should handle multiple observations with labels', async () => {
			service.observeHistogram( 'test_histogram', 0.2, { method: 'GET' } );
			service.observeHistogram( 'test_histogram', 0.4, { method: 'GET' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_histogram_sum{method="GET"} 0.6' );
			expect( metrics ).toContain( 'test_histogram_count{method="GET"} 2' );
		} );
		
		it( 'should handle invalid labels', () => {
			expect( () => {
				service.observeHistogram( 'test_histogram', 0.5, { '': 'invalid' } );
			} ).toThrow();
		} );
	} );
	
	describe( 'observeSummary', () => {
		it( 'should create and observe summary without labels', async () => {
			service.observeSummary( 'test_summary', 100 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary_sum 100' );
			expect( metrics ).toContain( 'test_summary_count 1' );
		} );
		
		it( 'should create and observe summary with labels', async () => {
			service.observeSummary( 'test_summary', 100, { endpoint: '/api' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary_sum{endpoint="/api"} 100' );
			expect( metrics ).toContain( 'test_summary_count{endpoint="/api"} 1' );
		} );
		
		it( 'should create summary with custom percentiles', async () => {
			service.observeSummary( 'test_summary', 100, {}, [ 0.5, 0.9 ] );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary{quantile="0.5"}' );
			expect( metrics ).toContain( 'test_summary{quantile="0.9"}' );
			expect( metrics ).toContain( 'test_summary_sum 100' );
			expect( metrics ).toContain( 'test_summary_count 1' );
		} );
		
		it( 'should handle multiple observations', async () => {
			service.observeSummary( 'test_summary', 100 );
			service.observeSummary( 'test_summary', 200 );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_summary_sum 300' );
			expect( metrics ).toContain( 'test_summary_count 2' );
		} );
		
		it( 'should handle multiple observations with labels', async () => {
			service.observeSummary( 'test_summary', 100, { endpoint: '/api' } );
			service.observeSummary( 'test_summary', 200, { endpoint: '/api' } );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_summary_sum{endpoint="/api"} 300' );
			expect( metrics ).toContain( 'test_summary_count{endpoint="/api"} 2' );
		} );
		
		it( 'should handle invalid labels', () => {
			expect( () => {
				service.observeSummary( 'test_summary', 100, { '': 'invalid' } );
			} ).toThrow();
		} );
		
		it( 'should handle invalid labels', () => {
			expect( () => {
				service.observeSummary( 'test_summary', 100, { '': 'invalid' } );
			} ).toThrow();
		} );
	} );
} );