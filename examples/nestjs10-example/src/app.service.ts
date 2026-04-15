import { Injectable } from '@nestjs/common';
import { ReporterService } from 'nestjs-metrics-reporter';

@Injectable()
export class AppService {
	private users: { id: number; name: string }[] = [];
	private nextId = 1;

	getHello(): string {
		ReporterService.counter('hello_requests_total', { endpoint: '/' });
		return 'Hello World!';
	}

	getUsers(): { id: number; name: string }[] {
		ReporterService.counter('users_list_requests_total', { endpoint: '/users' });
		ReporterService.gauge('users_count', this.users.length, { type: 'total' });
		return this.users;
	}

	createUser(name: string): { id: number; name: string } {
		const startTime = Date.now();

		const user = { id: this.nextId++, name };
		this.users.push(user);

		const duration = Date.now() - startTime;

		ReporterService.counter('users_created_total', { source: 'api' });
		ReporterService.histogram('user_creation_duration_ms', duration, { operation: 'create' });
		ReporterService.gauge('users_count', this.users.length, { type: 'total' });

		return user;
	}
}
