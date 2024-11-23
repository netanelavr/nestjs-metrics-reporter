export interface PrometheusOptions {
     defaultMetricsEnabled?: boolean;
     path?: string;
     defaultLabels?: Record<string, string>;
}

export interface ReporterOptions {
     logErrors?: boolean;
     defaultLabels?: Record<string, string>;
}