import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ReporterModule, ReporterService } from '../src';

describe('ReporterModule (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ReporterModule.forRoot({
					defaultMetricsEnabled: false,
					defaultLabels: {
						app: 'e2e-test',
						env: 'test',
					},
				}),
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	describe('/metrics (GET)', () => {
		it('should return metrics endpoint', async () => {
			ReporterService.counter('initial_metric', { test: 'true' });

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('# HELP');
			expect(response.text).toContain('initial_metric');
		});

		it('should include default labels in metrics', async () => {
			ReporterService.counter('test_counter', { action: 'test' });

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('app="e2e-test"');
			expect(response.text).toContain('env="test"');
		});
	});

	describe('Counter metrics', () => {
		it('should record counter increments', async () => {
			ReporterService.counter('e2e_counter_total', { source: 'test' });
			ReporterService.counter('e2e_counter_total', { source: 'test' });
			ReporterService.counter('e2e_counter_total', { source: 'test' }, 3);

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('e2e_counter_total');
			expect(response.text).toContain('source="test"');
		});
	});

	describe('Gauge metrics', () => {
		it('should record gauge values', async () => {
			ReporterService.gauge('e2e_gauge', 42, { type: 'test' });

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('e2e_gauge');
			expect(response.text).toContain('42');
		});

		it('should update gauge values', async () => {
			ReporterService.gauge('e2e_gauge_update', 10, { type: 'test' });
			ReporterService.gauge('e2e_gauge_update', 20, { type: 'test' });

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('e2e_gauge_update');
			expect(response.text).toContain('20');
		});
	});

	describe('Histogram metrics', () => {
		it('should record histogram observations', async () => {
			ReporterService.histogram('e2e_histogram_duration', 100, { operation: 'test' });
			ReporterService.histogram('e2e_histogram_duration', 200, { operation: 'test' });
			ReporterService.histogram('e2e_histogram_duration', 50, { operation: 'test' });

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('e2e_histogram_duration_bucket');
			expect(response.text).toContain('e2e_histogram_duration_sum');
			expect(response.text).toContain('e2e_histogram_duration_count');
		});
	});

	describe('Summary metrics', () => {
		it('should record summary observations', async () => {
			ReporterService.summary('e2e_summary_values', 10, { type: 'test' });
			ReporterService.summary('e2e_summary_values', 20, { type: 'test' });
			ReporterService.summary('e2e_summary_values', 30, { type: 'test' });

			const response = await request(app.getHttpServer()).get('/metrics').expect(200);

			expect(response.text).toContain('e2e_summary_values');
			expect(response.text).toContain('e2e_summary_values_sum');
			expect(response.text).toContain('e2e_summary_values_count');
		});
	});
});

describe('ReporterModule.forRootAsync (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ReporterModule.forRootAsync({
					useFactory: () => ({
						defaultMetricsEnabled: false,
						defaultLabels: {
							app: 'async-e2e-test',
						},
					}),
				}),
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('should work with async configuration', async () => {
		ReporterService.counter('async_test_counter', { source: 'async' });

		const response = await request(app.getHttpServer()).get('/metrics').expect(200);

		expect(response.text).toContain('async_test_counter');
		expect(response.text).toContain('app="async-e2e-test"');
	});
});
