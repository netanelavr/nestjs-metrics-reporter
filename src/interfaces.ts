export interface MetricsConfig {
	defaultLabels?: Record<string, string>;
	defaultMetricsEnabled?: boolean;
}

export interface ReporterAsyncOptions {
	imports?: any[];
	useFactory: ( ...args: any[] )=> Promise<MetricsConfig> | MetricsConfig;
	inject?: any[];
  }