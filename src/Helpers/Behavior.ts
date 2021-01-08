import * as express from 'express';
import { Method } from 'axios';

export type Destination = {
    url: string;
    ttl: number;
};

export type Behaviors = Record<string, Destination>;

export interface ProxyRequestParameters {
    method: Method;
    url: string;
    key: string;
    ttl: number;
}

export const requestParameters = (behavior: Destination, request: express.Request): ProxyRequestParameters => {
    const method = request.method as Method;
    const url = behavior.url + request.path;
    const key = `${method}#${url}`;
    return { method, url, key, ttl: behavior.ttl };
};
