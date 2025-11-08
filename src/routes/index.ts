import { createProxyMiddleware } from 'http-proxy-middleware';
import { GatewayRoute } from '../config/config.loader.js';

export function registerRoutes(app: any, routes: GatewayRoute[]) {
  for (const route of routes) {
    app.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite: { [`^${route.path}`]: '' }
      })
    );
    console.log(`✅ Route mounted: ${route.path} → ${route.target}`);
  }
}
