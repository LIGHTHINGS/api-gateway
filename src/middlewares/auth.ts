import type { Protocol, RequestHandler } from 'restana';
import type { AuthOptions, AuthorizationConfig } from '../config/config.loader.js';
import { AppNext, AppRequest, AppResponse } from '../index.js';
import jwt from 'jsonwebtoken';

export const createAuthentication = (options?: AuthOptions): RequestHandler<Protocol.HTTP> => {
  if (!options?.enabled) return (req: AppRequest, res: AppResponse, next:AppNext) => next();

  return (req: AppRequest, res: AppResponse, next:AppNext) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.send({ message: 'Missing or Invalid token' }, 401);
    }
    
     const token = authHeader.split(' ')[1];
   try {
    const payload = jwt.verify(token, options.secret || 'default_secret');
    (req as any).user = payload;
    return next();
    
   } catch (error) {
    
     }

    res.send({ message: 'Unauthorized' }, 401);
  };
};


export const createAuthorization = (config?: AuthorizationConfig): RequestHandler<Protocol.HTTP> => {
  if (!config?.enabled) return (req: AppRequest, res: AppResponse, next: AppNext) => next();

  return (req: AppRequest, res: AppResponse, next: AppNext) => {
    const role = (req.headers['x-role'] as string) || 'guest';
    const allowedPaths = config.roles?.[role] || [];

    if (allowedPaths.some(path => req.url ? req?.url.startsWith(path): false)) return next();

    res.send({ message: 'Forbidden: insufficient privileges' }, 403);
  };
};
