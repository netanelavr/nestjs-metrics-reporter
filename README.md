# nestjs-metrics-client

<div align="center">

[![npm version](https://badge.fury.io/js/nestjs-metrics-client.svg)](https://badge.fury.io/js/nestjs-metrics-client)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)

📊 A **zero-dependency-injection** alternative to Prometheus metrics solutions for NestJS.  
Effortlessly report metrics from anywhere in your codebase without complex setup or dependency injection.

[Overview](#overview) •
[Quick Start](#quick-start) •
[API Reference](#api-reference) •
[Contributing](#contributing) •
[License](#license)

</div>


## Installation

```bash
npm install nestjs-metrics-client
```
---

## Overview

`nestjs-metrics-client` is a lightweight, **zero-setup** alternative to [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus), eliminating the need for dependency injection or extensive configuration.
Instantly report metrics from anywhere in your application using a global static reporter.

```typescript
import { ReporterService } from 'nestjs-metrics-client';

ReporterService.counter('api_requests_total', { endpoint: '/users' });
```
---

## Why Choose `nestjs-metrics-client`?

🚀 **No Dependency Injection**  
Unlike [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus), `nestjs-metrics-client` removes the need for cumbersome dependency injection, making your code cleaner and more portable.

🌟 **Effortless Integration**  
With minimal setup, you can start tracking metrics immediately. No need to configure a service in every file—just use the global `ReporterService`.

🎯 **Focus on Simplicity**  
Designed for developers who want powerful metrics without the complexity of managing dependencies or boilerplate code.

---

## Quick Start

### 1. Import and Configure the Module

Minimal setup required! Just import the `ReporterModule` in your `AppModule`.

```typescript
import { Module } from "@nestjs/common";
import { ReporterModule } from 'nestjs-metrics-client';

@Module({
  imports: [
    ReporterModule.forRoot({
      // Default metrics are disabled by default, set to true to enable.
      defaultMetricsEnabled: true,
      defaultLabels: {
        app: 'my-app',
        environment: 'production',
      }
    }),
  ],
})
export class AppModule {}
```

### 2. Initialize the Global Reporter

Easily initialize the global `ReporterService` in your bootstrap function. No additional injections required.

```typescript
import { NestFactory } from '@nestjs/core';
import { MetricsService, ReporterService } from 'nestjs-metrics-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize the global reporter
  ReporterService.init(app.get(MetricsService));

  await app.listen(3000);
}
```

### 3. Report Metrics Anywhere

Once initialized, you can start reporting metrics instantly from anywhere in your application.

```typescript
import { Injectable } from '@nestjs/common';
import { ReporterService } from 'nestjs-metrics-client';

@Injectable()
export class UserService {
  async createUser() {
    // Increment user creation counter
    ReporterService.counter('users_created_total', {
      source: 'api',
      user_type: 'standard'
    });

    // Update active user gauge
    ReporterService.gauge('active_users', 42, {
      region: 'us-east-1'
    });
  }
}
```
---

## API Reference

The global static service for reporting metrics:

| Method       | Description                 | Parameters                                                  |
|--------------|-----------------------------|-------------------------------------------------------------|
| `init()`     | Initialize the reporter     | `metricsService: MetricsService`                           |
| `counter()`  | Increment a counter metric  | `key: string, labels?: Record<string, string | number>`     |
| `gauge()`    | Set a gauge value          | `key: string, value: number, labels?: Record<string, string | number>` |
| `histogram()`| Record a histogram value    | `key: string, value: number, labels?: Record<string, string | number>, buckets?: number[]` |
| `summary()`  | Record a summary value      | `key: string, value: number, labels?: Record<string, string | number>, percentiles?: number[]` |

### Module Configuration

#### `ReporterModule.forRoot(options)`

| Option                  | Type                       | Default    | Description                                   |
|-------------------------|----------------------------|------------|-----------------------------------------------|
| `defaultMetricsEnabled` | `boolean`                 | `false`    | Enable collection of default metrics          |
| `defaultLabels`         | `Record<string, string>`  | `{}`       | Labels automatically added to all metrics     |

#### `ReporterModule.forRootAsync(options)`

Supports dynamic configuration with factory providers:

```typescript
ReporterModule.forRootAsync({
  useFactory: () => ({
    defaultLabels: {
      app: process.env.APP_NAME || 'default-app',
      environment: process.env.NODE_ENV || 'development',
    },
  }),
});
```

---

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
refactor: message # Neither fixes a bug nor adds a feature
style: message    # Code style (formatting, semicolons, etc)
test: message     # Adding or correcting tests
```

Any other prefix will cause the commit to be ignored by semantic-release and won't appear anywhere in release notes.

---
## Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

---