# nestjs-metrics-client

<div align="center">

[![npm version](https://badge.fury.io/js/nestjs-metrics-client.svg)](https://badge.fury.io/js/nestjs-metrics-client)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)

📊 A zero-dependency-injection Prometheus metrics reporter for NestJS applications.
Report metrics from anywhere in your codebase without the complexity of dependency injection.

[Key Features](#key-features) •
[Quick Start](#quick-start) •
[API Reference](#api-reference) •
[Examples](#examples) •
[Contributing](#contributing)

</div>

## Overview

`nestjs-metrics-client` enables effortless metrics reporting from anywhere in your NestJS application without the complexity of dependency injection. It serves as a lightweight, type-safe alternative to [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus), focusing on simplicity and ease of use.

```typescript
// Report metrics from anywhere!
ReporterService.counter('api_requests_total', { endpoint: '/users' });
```

## Key Features

🌟 **Zero Dependency Injection** - Use a global static reporter to track metrics from any file

🔒 **Type-Safe API** - Built with TypeScript for robust type checking and IDE support

⚡ **High Performance** - Optimized for production environments with minimal overhead

🛠️ **Flexible Configuration** - Support for both sync and async module configuration

🎯 **Production Ready**
- Built-in error handling
- Default metrics collection
- Support for Counter, Gauge, Histogram, and Summary metrics
- Customizable labels and buckets/percentiles

## Installation

```bash
# Using npm
npm install nestjs-metrics-client

# Using yarn
yarn add nestjs-metrics-client

# Using pnpm
pnpm add nestjs-metrics-client
```

## Quick Start

### 1. Import the Module

```typescript
import { ReporterModule } from 'nestjs-metrics-client';

@Module({
  imports: [
    ReporterModule.forRoot({
      defaultMetricsEnabled: true,
      defaultLabels: {
        app: 'my-app',
        environment: 'production'
      }
    }),
  ],
})
export class AppModule {}
```

### 2. Initialize the Service

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

### 3. Start Reporting Metrics

```typescript
import { ReporterService } from 'nestjs-metrics-client';

@Injectable()
export class UserService {
  async createUser() {
    // Track user creation
    ReporterService.counter('users_created_total', { 
      source: 'api',
      user_type: 'standard'
    });
    
    // Track active users
    ReporterService.gauge('active_users', 42, { 
      region: 'us-east-1'
    });
  }
}
```

## API Reference

### ReporterService

Static methods for reporting metrics:

| Method | Description | Parameters |
|--------|-------------|------------|
| `init()` | Initialize the reporter service | `metricsService: MetricsService` |
| `counter()` | Increment a counter | `key: string, labels?: Record<string, string \| number>` |
| `gauge()` | Set a gauge value | `key: string, value: number, labels?: Record<string, string \| number>` |
| `histogram()` | Observe a histogram value | `key: string, value: number, labels?: Record<string, string \| number>, buckets?: number[]` |
| `summary()` | Observe a summary value | `key: string, value: number, labels?: Record<string, string \| number>, percentiles?: number[]` |

### Configuration Options

#### ReporterModule.forRoot(options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultMetricsEnabled` | `boolean` | `true` | Enable default metrics collection |
| `defaultLabels` | `Record<string, string>` | `{}` | Labels added to all metrics |

#### ReporterModule.forRootAsync(options)

For dynamic configuration using factory providers:

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

## Examples

### Monitor Queue Size

```typescript
@Injectable()
export class QueueService {
  private async checkQueueSize() {
    const size = await this.queue.size();
    ReporterService.gauge('queue_size', size, {
      queue_name: 'email_notifications'
    });
  }
}
```

## Release Process

This package follows semantic versioning through commit messages:

### Version Bumping Commits

```bash
# Patch (1.0.X)
fix: bug fix message
perf: performance improvement

# Minor (1.X.0)
feat: new feature message

# Major (X.0.0)
feat!: breaking change message
BREAKING CHANGE: description in commit body
```

### Other Valid Commit Types

- `build`: Changes to build system/dependencies
- `chore`: Maintenance tasks
- `ci`: CI configuration changes
- `docs`: Documentation updates
- `refactor`: Code refactoring
- `style`: Code style changes
- `test`: Test-related changes

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.