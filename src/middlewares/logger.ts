import type { RequestHandler, Protocol } from 'restana';
import type { LoggerOptions } from '../config/config.loader.js';
import { AppNext, AppRequest, AppResponse } from '../index.js';

export const createLogger = (options?: LoggerOptions): RequestHandler<Protocol.HTTP> => {
  if (!options?.enabled) return (req: AppRequest, res: AppResponse, next: AppNext) => next();

    return (req: AppRequest, res: AppResponse, next:AppNext) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const msg = options.format
        ? options.format
            .replace(':method', req.method ?? '')
            .replace(':url', req.url ?? '')
            .replace(':time', duration.toString())
        : `${req.method ?? ''} ${req.url ?? ''} - ${duration}ms`;
      console.log(msg);
    });
    next();
  };
};
