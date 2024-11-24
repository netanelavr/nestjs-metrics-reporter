// tests/metrics.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Registry } from 'prom-client';
import { MetricsService } from "../src";

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
               const counterName = 'test_counter';
               service.incCounter( counterName );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_counter_total' );
               expect( metrics ).toContain( '# TYPE test_counter counter' );
          } );
          
          it( 'should create and increment counter with labels', async () => {
               const counterName = 'test_counter_labels';
               const labels = { method: 'GET', status: '200' };
               service.incCounter( counterName, labels );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_counter_labels_total{method="GET",status="200"} 1' );
          } );
          
          it( 'should increment existing counter', async () => {
               const counterName = 'test_counter_multiple';
               service.incCounter( counterName );
               service.incCounter( counterName );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_counter_multiple_total 2' );
          } );
     } );
     
     describe( 'setGauge', () => {
          it( 'should create and set gauge without labels', async () => {
               const gaugeName = 'test_gauge';
               service.setGauge( gaugeName, 42 );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_gauge 42' );
               expect( metrics ).toContain( '# TYPE test_gauge gauge' );
          } );
          
          it( 'should create and set gauge with labels', async () => {
               const gaugeName = 'test_gauge_labels';
               const labels = { region: 'us-east', instance: 'server1' };
               service.setGauge( gaugeName, 123.45, labels );
               
               const metrics = await registry.metrics();
               expect( metrics ).toContain( 'test_gauge_labels{region="us-east",instance="server1"} 123.45' );
          } );
     } );
} );