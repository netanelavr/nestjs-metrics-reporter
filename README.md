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

1. Import the ReporterModule in your app.module.ts:

```typescript
import { ReporterModule } from 'nestjs-metrics-client';

@Module({
  imports: [
    ReporterModule.forRoot({
      defaultMetricsEnabled: true,
      defaultLabels: {
        app: 'my-app'
      }
    }),
  ],
})
export class AppModule {}
```

2. Initialize the ReporterService in your main.ts:

```typescript
import { MetricsService, ReporterService } from 'nestjs-metrics-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Initialize the reporter service
  const metricsService = app.get(MetricsService);
  ReporterService.init(metricsService);
  
  await app.listen(3000);
}
```

3. Use the ReporterService anywhere in your application:

```typescript
import { ReporterService } from 'nestjs-metrics-client';

@Injectable()
export class YourService {
  someMethod() {
    // Increment a counter
    ReporterService.counter('my_counter', { label: 'value' });
    
    // Set a gauge value
    ReporterService.gauge('my_gauge', 42, { label: 'value' });
  }
}
```

4. Access metrics at `/metrics` endpoint.

## API Documentation

### ReporterService

Static methods:
- `init(metricsService: MetricsService)`: Initialize the reporter service
- `counter(key: string, labels?: Record<string, string | number>)`: Increment a counter
- `gauge(key: string, value: number, labels?: Record<string, string | number>)`: Set a gauge value

### ReporterModule.forRoot(options)

Options:
- `defaultMetricsEnabled`: Enable default metrics collection (default: true)
- `defaultLabels`: Default labels to add to all metrics (default: {})

### ReporterModule.forRootAsync(options)

For dynamic configuration:
```typescript
ReporterModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    defaultLabels: {
      app: configService.get('APP_NAME'),
      env: configService.get('NODE_ENV')
    }
  }),
  inject: [ConfigService]
})
```

## Release

This package uses semantic versioning via commit messages:

### Version Bumping Commits
```bash
# Patch Release (1.0.X)
fix: message      # Bug fixes
perf: message     # Performance improvements

# Minor Release (1.X.0)
feat: message     # New features

# Major Release (X.0.0)
feat!: message            # Breaking change
fix!: message             # Breaking change
BREAKING CHANGE: message  # Breaking change anywhere in the commit body
```

### Non-Version Bumping Commits
Only these specific types are allowed:
```bash
build: message    # Changes to build system or dependencies
chore: message    # Maintenance tasks
ci: message       # CI configuration files and scripts
docs: message     # Documentation only
perf: message     # Performance improvements
refactor: message # Neither fixes a bug nor adds a feature
style: message    # Code style (formatting, semicolons, etc)
test: message     # Adding or correcting tests
```

Any other prefix will cause the commit to be ignored by semantic-release and won't appear anywhere in release notes.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.