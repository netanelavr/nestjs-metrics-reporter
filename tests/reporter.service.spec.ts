import { Test, TestingModule } from '@nestjs/testing';
import { Registry } from 'prom-client';
import { Logger } from '@nestjs/common';
import { MetricsService, ReporterService } from "../src";

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
               ReporterService.counter( 'test_static_counter', { method: 'POST' } );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_static_counter_total{method="POST"} 1' );
          } );
          
          it( 'should handle errors gracefully', () => {
               ReporterService.counter( undefined as any, {} );
               expect( loggerSpy ).toHaveBeenCalled();
          } );
     } );
     
     describe( 'gauge', () => {
          it( 'should set gauge through static method', async () => {
               ReporterService.gauge( 'test_static_gauge', 42, { region: 'eu-west' } );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_static_gauge{region="eu-west"} 42' );
          } );
          
          it( 'should handle errors gracefully', () => {
               ReporterService.gauge( undefined as any, 42, {} );
               expect( loggerSpy ).toHaveBeenCalled();
          } );
     } );
} );
