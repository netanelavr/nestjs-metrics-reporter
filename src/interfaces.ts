export interface MetricsConfig {
	defaultLabels?: Record<string, string>;
	defaultMetricsEnabled?: boolean;
	pushgatewayUrl?: string;
	pushgatewayOptions?: {
		timeout?: number;
		headers?: Record<string, string>;
		auth?: {
			username: string;
			password: string;
		};
	};
}

export interface ReporterAsyncOptions {
	imports?: any[];
	useFactory: ( ...args: any[] )=> Promise<MetricsConfig> | MetricsConfig;
	inject?: any[];
  }

export interface PushgatewayResponse {
	status: number;
	success: boolean;
	message?: string;
}