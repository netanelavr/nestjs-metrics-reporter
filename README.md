# nestjs-metrics-client

A global static Prometheus metrics reporter for NestJS applications. This package provides a simple and efficient way to
report metrics from anywhere in your application without dependency injection.

**This package is a lightweight and flexible alternative to the [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus) package, offering a global static reporter approach.**

## Features

- Global static reporter - no need for dependency injection
- Support for Counter and Gauge metrics
- Type-safe API
- Easy integration with NestJS applications
- Configurable default metrics
- Built-in error handling

## Installation

```bash
npm install nestjs-metrics-client
```

## Quick Start

1. Import the MetricsModule in your app.module.ts:

```typescript
import { MetricsModule } from 'nestjs-metrics-client';

@Module( {
     imports: [
          MetricsModule.forRoot( {
               defaultMetricsEnabled: true,
               defaultLabels: {
                    app: 'my-app'
               }
          } ),
     ],
} )
export class AppModule {
}
```

2. Initialize the ReporterService in your main.ts:

```typescript
import { ReporterService } from 'nestjs-metrics-client';

async function bootstrap() {
     const app = await NestFactory.create( AppModule );
     
     // Initialize the reporter service
     const metricsService = app.get( MetricsService );
     ReporterService.init( metricsService );
     
     await app.listen( 3000 );
}
```

3. Use the ReporterService anywhere in your application:

```typescript
import { ReporterService } from 'nestjs-metrics-client';

@Injectable()
export class YourService {
     someMethod() {
          // Increment a counter
          ReporterService.counter( 'my_counter', { label: 'value' } );
          
          // Set a gauge value
          ReporterService.gauge( 'my_gauge', 42, { label: 'value' } );
     }
}
```

## Documentation

### ReporterService

Static methods:

- `init(metricsService: MetricsService)`: Initialize the reporter service
- `counter(key: string, labels?: Record<string, string | number>)`: Increment a counter
- `gauge(key: string, value: number, labels?: Record<string, string | number>)`: Set a gauge value

### MetricsModule.forRoot(options)

Options:

- `defaultMetricsEnabled`: Enable default metrics collection (default: true)
- `defaultLabels`: Default labels to add to all metrics (default: {})
- `path`: Path for metrics endpoint (default: '/metrics')

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and
the process for submitting pull requests.
