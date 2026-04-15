import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('users')
	getUsers(): { id: number; name: string }[] {
		return this.appService.getUsers();
	}

	@Post('users')
	createUser(@Body() body: { name: string }): { id: number; name: string } {
		return this.appService.createUser(body.name);
	}
}
