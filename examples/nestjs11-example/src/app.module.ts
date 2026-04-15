import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReporterModule } from 'nestjs-metrics-reporter';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ReporterModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				defaultMetricsEnabled: true,
				defaultLabels: {
					app: configService.get('APP_NAME') || 'nestjs11-example',
					environment: configService.get('NODE_ENV') || 'development',
				},
				pushgatewayUrl: configService.get('PUSHGATEWAY_URL'),
			}),
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
