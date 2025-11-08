import { createLogger } from './middlewares/logger.js';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/index.js';
import { createGateway } from './app.js';
import { loadGatewayConfig } from './config/config.loader.js';
import { createAuthentication, createAuthorization } from './middlewares/auth.js';
import { createCors } from './middlewares/cors.js';
import { createCache } from './middlewares/cache.js';
import { createTracing } from './middlewares/tracing.js';

dotenv.config({ path: './config/app.env' });

const config = loadGatewayConfig();

const app = createGateway({protocol: config.protocol });


export type AppRequest = Parameters<Parameters<typeof app.get>[1]>[0];
export type AppResponse = Parameters<Parameters<typeof app.get>[1]>[1];
export type AppNext = Parameters<Parameters<typeof app.get>[1]>[2];

type AppType = typeof app extends ReturnType<infer T> ? T : never; 
type AppProtocol = AppType extends { protocol: infer P } ? P : never;

if (config.middlewares?.logger) app.use(createLogger(config.middlewares.logger));
if (config.middlewares.auth?.enabled) app.use(createAuthentication(config.middlewares.auth));
if (config.middlewares.cors?.enabled) app.use(createCors(config.middlewares.cors));

if (config.cache?.enabled) app.use(createCache(config.cache));
if (config.authorization?.enabled) app.use(createAuthorization(config.authorization));
if (config.tracing?.enabled) app.use(createTracing(config.tracing));

if(config.routes.length > 0) registerRoutes(app, config.routes);


app.start(config.port || 8080).then(() => {
  console.log(`🚀 Gateway running with ${config.protocol.toUpperCase()} on port ${process.env.PORT || 8080}`);
});
