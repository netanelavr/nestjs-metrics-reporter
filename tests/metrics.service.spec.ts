import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from '../src';
import { Registry } from 'prom-client';

describe('MetricsService', () => {
	let service: MetricsService;
	let registry: Registry;
     
	beforeEach(async () => {
		registry = new Registry();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MetricsService,
				{
					provide: Registry,
					useValue: registry,
				},
			],
		}).compile();
          
		service = module.get<MetricsService>(MetricsService);
	});
     
	afterEach(() => {
		registry.clear();
	});
     
	describe('incCounter', () => {
		it('should create and increment counter without labels', async () => {
			service.incCounter('test_counter');
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_counter Counter for test_counter');
			expect(metrics).toContain('# TYPE test_counter counter');
			expect(metrics).toContain('test_counter 1');
		});
          
		it('should create and increment counter with labels', async () => {
			service.incCounter('test_counter', { method: 'GET' });
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_counter Counter for test_counter');
			expect(metrics).toContain('# TYPE test_counter counter');
			expect(metrics).toContain('test_counter{method="GET"} 1');
		});
          
		it('should increment existing counter', async () => {
			service.incCounter('test_counter');
			service.incCounter('test_counter');
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_counter Counter for test_counter');
			expect(metrics).toContain('# TYPE test_counter counter');
			expect(metrics).toContain('test_counter 2');
		});
          
		it('should handle invalid labels', () => {
			expect(() => {
				service.incCounter('test_counter', { '': 'invalid' });
			}).toThrow();
		});
	});
     
	describe('setGauge', () => {
		it('should create and set gauge', async () => {
			service.setGauge('test_gauge', 42);
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_gauge Gauge for test_gauge');
			expect(metrics).toContain('# TYPE test_gauge gauge');
			expect(metrics).toContain('test_gauge 42');
		});
          
		it('should create and set gauge with labels', async () => {
			service.setGauge('test_gauge', 42, { region: 'us' });
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_gauge Gauge for test_gauge');
			expect(metrics).toContain('# TYPE test_gauge gauge');
			expect(metrics).toContain('test_gauge{region="us"} 42');
		});
          
		it('should update existing gauge value', async () => {
			service.setGauge('test_gauge', 42);
			service.setGauge('test_gauge', 84);
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_gauge Gauge for test_gauge');
			expect(metrics).toContain('# TYPE test_gauge gauge');
			expect(metrics).toContain('test_gauge 84');
		});
          
		it('should handle negative values', async () => {
			service.setGauge('test_gauge', -42);
			const metrics = await registry.metrics();
			expect(metrics).toContain('# HELP test_gauge Gauge for test_gauge');
			expect(metrics).toContain('# TYPE test_gauge gauge');
			expect(metrics).toContain('test_gauge -42');
		});
	});
});