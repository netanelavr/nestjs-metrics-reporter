import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('orders')
	getOrders(): { id: number; product: string; quantity: number }[] {
		return this.appService.getOrders();
	}

	@Post('orders')
	createOrder(@Body() body: { product: string; quantity: number }): { id: number; product: string; quantity: number } {
		return this.appService.createOrder(body.product, body.quantity);
	}

	@Delete('orders/:id')
	deleteOrder(@Param('id') id: string): { success: boolean } {
		return this.appService.deleteOrder(parseInt(id, 10));
	}
}
