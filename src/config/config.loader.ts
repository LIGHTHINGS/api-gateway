import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export interface GatewayRoute {
  path: string;
  target: string;
}

export interface LoggerOptions {
  enabled: boolean;
  format?: string;
}

export interface AuthOptions {
  enabled: boolean;
  secret?: string;
  header?: string;
}

export interface CorsOptions {
  enabled: boolean;
  origin?: string;
  methods?: string[];
}

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number;
  redisUrl?: string;
  type: 'memory' | 'redis';
}

export interface AuthorizationConfig {
  enabled: boolean;
  roles?: Record<string, string[]>;
}

export interface TracingConfig {
  enabled: boolean;
  provider?: 'opentelemetry';
  serviceName?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsPath?: string;
  collectInterval?: number;
}


export interface GatewayConfig {
  protocol: 'http' | 'https' | 'http2';
  port: number;
  routes: GatewayRoute[];
  middlewares: {
    logger?: LoggerOptions;
    auth?: AuthOptions;
    cors?: CorsOptions;
  };
  cache?: CacheConfig;
  authorization?: AuthorizationConfig;
  tracing?: TracingConfig;
  monitoring?: MonitoringConfig;
}

export function loadGatewayConfig(): GatewayConfig {
  const configPath = path.resolve(__dirname, 'gateway.config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as GatewayConfig;
}
