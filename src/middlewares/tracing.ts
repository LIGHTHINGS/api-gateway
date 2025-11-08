import type { Protocol, RequestHandler } from 'restana';
import type { TracingConfig } from '../config/config.loader.js';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { AppNext, AppRequest, AppResponse } from '../index.js';

export const createTracing = (config?: TracingConfig): RequestHandler<Protocol.HTTP> => {
  if (!config?.enabled) return (req: AppRequest, res: AppResponse, next: AppNext) => next();

  const tracer = trace.getTracer(config.serviceName || 'gateway');

  return (req: AppRequest, res: AppResponse, next: AppNext) => {
    const span = tracer.startSpan(`HTTP ${req.method} ${req.url}`);
    context.with(trace.setSpan(context.active(), span), () => {
      res.on('finish', () => {
        span.setAttribute('http.status_code', res.statusCode);
        if (res.statusCode >= 400) span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
      });
      next();
    });
  };
};
