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
     
	describe( 'initialization', () => {
		it( 'should throw error if used before initialization', () => {
			( ReporterService as any ).metricsService = undefined;
               
			expect( () => {
				ReporterService.counter( 'test_counter' );
			} ).toThrow();
		} );
	} );
} );