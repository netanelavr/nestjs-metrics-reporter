# NestJS 10 Metrics Reporter Example

This example demonstrates how to use `nestjs-metrics-reporter` with NestJS 10.

## Installation

```bash
npm install
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

   # Get users
   curl http://localhost:3000/users

   # Create a user
   curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "John"}'
   ```

3. View the metrics:
   ```bash
   curl http://localhost:3000/metrics
   ```

## Metrics exposed

- `hello_requests_total` - Counter for hello endpoint requests
- `users_list_requests_total` - Counter for user list requests
- `users_created_total` - Counter for user creation
- `user_creation_duration_ms` - Histogram for user creation duration
- `users_count` - Gauge for total user count
- Default Node.js metrics (memory, CPU, etc.)
