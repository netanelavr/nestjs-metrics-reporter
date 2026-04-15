# NestJS 11 Metrics Reporter Example

This example demonstrates how to use `nestjs-metrics-reporter` with NestJS 11, including async configuration with `@nestjs/config`.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file (optional):

```env
APP_NAME=my-orders-app
NODE_ENV=development
PUSHGATEWAY_URL=http://pushgateway:9091
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev
```

## Testing the metrics

1. Start the application:
   ```bash
   npm run start:dev
   ```

2. Make some requests:
   ```bash
   # Hello endpoint
   curl http://localhost:3000

   # Get orders
   curl http://localhost:3000/orders

   # Create an order
   curl -X POST http://localhost:3000/orders \
     -H "Content-Type: application/json" \
     -d '{"product": "widget", "quantity": 5}'

   # Delete an order
   curl -X DELETE http://localhost:3000/orders/1
   ```

3. View the metrics:
   ```bash
   curl http://localhost:3000/metrics
   ```

## Metrics exposed

- `api_requests_total` - Counter for all API requests (with endpoint and method labels)
- `orders_created_total` - Counter for order creation
- `orders_deleted_total` - Counter for order deletion (with status label)
- `order_processing_duration_ms` - Histogram for operation duration
- `orders_count` - Gauge for total order count
- `order_quantity_summary` - Summary of order quantities
- Default Node.js metrics (memory, CPU, etc.)

## Features demonstrated

- Async module configuration with `forRootAsync`
- Integration with `@nestjs/config`
- Environment-based configuration
- All metric types: Counter, Gauge, Histogram, Summary
- Multiple labels per metric
