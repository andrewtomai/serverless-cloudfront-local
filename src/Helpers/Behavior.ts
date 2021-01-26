import * as express from 'express';
import { Method } from 'axios';
import * as Cache from './Cache';

import urljoin = require('url-join');

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
    const url = urljoin(behavior.url, request.path);
    const key = Cache.createKey(request.path, method);
    return { method, url, key, ttl: behavior.ttl };
};
