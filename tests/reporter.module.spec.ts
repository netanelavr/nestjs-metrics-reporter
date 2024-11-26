import { Test, TestingModule } from '@nestjs/testing';
import { Registry } from 'prom-client';
import { MetricsService, ReporterModule, ReporterService } from '../src';

describe( 'ReporterModule', () => {
	let module: TestingModule;
 
	afterEach( async () => {
		if ( module ) {
			await module.close();
		}
		( ReporterService as any ).metricsService = undefined;
	} );
 
	describe( 'forRoot', () => {
		it( 'should configure default labels', async () => {
			module = await Test.createTestingModule( {
				imports: [
					ReporterModule.forRoot( {
						defaultLabels: {
							app: 'test-app',
							environment: 'test'
						}
					} )
				],
			} ).compile();
			
			const reporterService = module.get<ReporterService>( ReporterService );
			reporterService.onApplicationBootstrap();
			
			ReporterService.counter( 'test_counter' );
   
			const registry = module.get<Registry>( Registry );
			const metrics = await registry.metrics();
			
			expect( metrics ).toContain( 'app="test-app"' );
			expect( metrics ).toContain( 'environment="test"' );
		} );
		
		it( 'should work without configuration', async () => {
			module = await Test.createTestingModule( {
				imports: [ReporterModule.forRoot()],
			} ).compile();
			
			expect( module.get( Registry ) ).toBeDefined();
			expect( module.get( MetricsService ) ).toBeDefined();
		} );
	} );
	
	describe( 'forRootAsync', () => {
		it( 'should support async configuration', async () => {
			module = await Test.createTestingModule( {
				imports: [
					ReporterModule.forRootAsync( {
						useFactory: async () => ( {
							defaultLabels: {
								app: 'async-app'
							}
						} )
					} )
				],
			} ).compile();
			
			const reporterService = module.get<ReporterService>( ReporterService );
			reporterService.onApplicationBootstrap();
			
			ReporterService.counter( 'test_counter' );
   
			const registry = module.get<Registry>( Registry );
			const metrics = await registry.metrics();
   
			expect( metrics ).toContain( 'app="async-app"' );
		} );
  
		it( 'should disable default metrics when configured', async () => {
			module = await Test.createTestingModule( {
				imports: [
					ReporterModule.forRoot( {
						defaultMetricsEnabled: false
					} )
				],
			} ).compile();
   
			const registry = module.get<Registry>( Registry );
			const metrics = await registry.metrics();
   
			expect( metrics ).not.toContain( 'process_cpu_user_seconds_total' );
		} );
  
		it( 'should handle async factory errors', async () => {
			const errorFactory = async () => {
				throw new Error( 'Config error' );
			};
   
			await expect( Test.createTestingModule( {
				imports: [
					ReporterModule.forRootAsync( {
						useFactory: errorFactory
					} )
				],
			} ).compile() ).rejects.toThrow( 'Config error' );
		} );
	} );
} );