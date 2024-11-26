import { Test, TestingModule } from '@nestjs/testing';
import { Registry, Counter } from 'prom-client';
import { MetricsController } from '../src';

describe( 'MetricsController', () => {
	let controller: MetricsController;
	let registry: Registry;
     
	beforeEach( async () => {
		registry = new Registry();
		const module: TestingModule = await Test.createTestingModule( {
			controllers: [MetricsController],
			providers: [
				{
					provide: Registry,
					useValue: registry,
				},
			],
		} ).compile();
          
		controller = module.get<MetricsController>( MetricsController );
	} );
     
	afterEach( () => {
		registry.clear();
	} );
     
	describe( 'getMetrics', () => {
		it( 'should return prometheus metrics', async () => {
			const counter = new Counter( {
				name: 'test_counter',
				help: 'test counter help',
				registers: [registry]
			} );
               
			counter.inc();
               
			const metrics = await controller.getMetrics();
			expect( metrics ).toBeDefined();
			expect( typeof metrics ).toBe( 'string' );
			expect( metrics ).toContain( '# HELP test_counter test counter help' );
			expect( metrics ).toContain( 'test_counter 1' );
		} );
          
		it( 'should handle empty metrics registry', async () => {
			const metrics = await controller.getMetrics();
			expect( metrics ).toBeDefined();
			expect( typeof metrics ).toBe( 'string' );
			expect( metrics.trim() ).toBe( '' );
		} );
          
		it( 'should handle registry errors', async () => {
			jest.spyOn( registry, 'metrics' ).mockRejectedValue( new Error( 'Registry error' ) );
			await expect( controller.getMetrics() ).rejects.toThrow( 'Registry error' );
		} );
	} );
} );