import { Test, TestingModule } from '@nestjs/testing';
import { Registry, Pushgateway } from 'prom-client';
import { CONFIG_OPTIONS } from '../constants';
import { MetricsService } from './metrics.service';

const mockPushAdd = jest.fn().mockResolvedValue( undefined );

jest.mock( 'prom-client', () => {
	const actual = jest.requireActual( 'prom-client' );
	return {
		...actual,
		Pushgateway: jest.fn().mockImplementation( () => ( {
			pushAdd: mockPushAdd
		} ) )
	};
} );

describe( 'MetricsService', () => {
	let service: MetricsService;
	let registry: Registry;
     
	const mockConfig = {
		pushgatewayUrl: 'http://test-pushgateway:9091'
	};
     
	beforeEach( async () => {
		mockPushAdd.mockClear();
          
		registry = new Registry();
		const module: TestingModule = await Test.createTestingModule( {
			providers: [
				MetricsService,
				{
					provide: Registry,
					useValue: registry,
				},
				{
					provide: CONFIG_OPTIONS,
					useValue: mockConfig,
				},
			],
		} ).compile();
          
		service = module.get<MetricsService>( MetricsService );
	} );
     
	afterEach( () => {
		registry.clear();
		jest.clearAllMocks();
	} );
     
	describe( 'constructor', () => {
		it( 'should initialize only in case a pushgateway URL is provided', () => {
			expect( Pushgateway ).toHaveBeenCalledWith( 'http://test-pushgateway:9091', [], registry );
		} );
	} );
     
	describe( 'pushMetrics', () => {
		it( 'should successfully push metrics', async () => {
			mockPushAdd.mockResolvedValueOnce( undefined );
               
			const result = await service.pushMetrics( 'test-job' );
               
			expect( mockPushAdd ).toHaveBeenCalledWith( { jobName: 'test-job' } );
			expect( result ).toEqual( {
				status: 200,
				success: true
			} );
		} );
          
		it( 'should handle push failure with Error object', async () => {
			const errorMessage = 'Failed to push metrics';
			mockPushAdd.mockRejectedValueOnce( new Error( errorMessage ) );
               
			const result = await service.pushMetrics( 'test-job' );
               
			expect( result ).toEqual( {
				status: 500,
				success: false,
				message: errorMessage
			} );
		} );
          
		it( 'should handle push failure with string error', async () => {
			const errorMessage = 'Network error';
			mockPushAdd.mockRejectedValueOnce( errorMessage );
               
			const result = await service.pushMetrics( 'test-job' );
               
			expect( result ).toEqual( {
				status: 500,
				success: false,
				message: errorMessage
			} );
		} );
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
			service.observeHistogram( 'test_histogram', 0.5, {}, [0.1, 0.3, 0.5, 1.0] );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.1"} 0' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.3"} 0' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="0.5"} 1' );
			expect( metrics ).toContain( 'test_histogram_bucket{le="1"} 1' );
			expect( metrics ).toContain( 'test_histogram_count 1' );
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
			service.observeSummary( 'test_summary', 100, {}, [0.5, 0.9] );
			const metrics = await registry.metrics();
			expect( metrics ).toContain( '# HELP test_summary Summary for test_summary' );
			expect( metrics ).toContain( '# TYPE test_summary summary' );
			expect( metrics ).toContain( 'test_summary{quantile="0.5"}' );
			expect( metrics ).toContain( 'test_summary{quantile="0.9"}' );
			expect( metrics ).toContain( 'test_summary_sum 100' );
			expect( metrics ).toContain( 'test_summary_count 1' );
		} );
	} );
} );