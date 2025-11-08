import type { Protocol, RequestHandler } from 'restana';
import type { CorsOptions } from '../config/config.loader.js';
import { AppNext, AppRequest, AppResponse } from '../index.js';

export const createCors = (options?: CorsOptions): RequestHandler<Protocol.HTTP> => {
  if (!options?.enabled) return (req:AppRequest, res: AppResponse, next:AppNext) => next();

  return (req:AppRequest, res: AppResponse, next:AppNext) => {
    res.setHeader('Access-Control-Allow-Origin', options.origin || '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      (options.methods || ['GET', 'POST', 'PUT', 'DELETE']).join(',')
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.send(204);
    } else {
      next();
    }
  };
};
