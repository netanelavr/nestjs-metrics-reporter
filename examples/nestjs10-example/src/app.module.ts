import { Module } from '@nestjs/common';
import { ReporterModule } from 'nestjs-metrics-reporter';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ReporterModule.forRoot({
			defaultMetricsEnabled: true,
			defaultLabels: {
				app: 'nestjs10-example',
				environment: 'development',
			},
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
