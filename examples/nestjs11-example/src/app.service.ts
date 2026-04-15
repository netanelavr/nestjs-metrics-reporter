import { Injectable } from '@nestjs/common';
import { ReporterService } from 'nestjs-metrics-reporter';

@Injectable()
export class AppService {
	private orders: { id: number; product: string; quantity: number }[] = [];
	private nextId = 1;

	getHello(): string {
		ReporterService.counter('api_requests_total', { endpoint: '/', method: 'GET' });
		return 'Hello from NestJS 11!';
	}

	getOrders(): { id: number; product: string; quantity: number }[] {
		ReporterService.counter('api_requests_total', { endpoint: '/orders', method: 'GET' });
		ReporterService.gauge('orders_count', this.orders.length, { status: 'active' });
		return this.orders;
	}

	createOrder(product: string, quantity: number): { id: number; product: string; quantity: number } {
		const startTime = Date.now();

		const order = { id: this.nextId++, product, quantity };
		this.orders.push(order);

		const duration = Date.now() - startTime;

		ReporterService.counter('api_requests_total', { endpoint: '/orders', method: 'POST' });
		ReporterService.counter('orders_created_total', { product_type: product });
		ReporterService.histogram('order_processing_duration_ms', duration, { operation: 'create' });
		ReporterService.gauge('orders_count', this.orders.length, { status: 'active' });
		ReporterService.summary('order_quantity_summary', quantity, { product });

		return order;
	}

	deleteOrder(id: number): { success: boolean } {
		const startTime = Date.now();
		const index = this.orders.findIndex((o) => o.id === id);

		if (index === -1) {
			ReporterService.counter('orders_deleted_total', { status: 'not_found' });
			return { success: false };
		}

		this.orders.splice(index, 1);
		const duration = Date.now() - startTime;

		ReporterService.counter('api_requests_total', { endpoint: '/orders/:id', method: 'DELETE' });
		ReporterService.counter('orders_deleted_total', { status: 'success' });
		ReporterService.histogram('order_processing_duration_ms', duration, { operation: 'delete' });
		ReporterService.gauge('orders_count', this.orders.length, { status: 'active' });

		return { success: true };
	}
}
