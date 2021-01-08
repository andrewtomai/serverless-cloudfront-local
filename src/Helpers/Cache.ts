import * as matcher from 'matcher';
import * as R from 'ramda';
import { AxiosResponse } from 'axios';

type CacheValue = {
    timeRetrieved: number;
    response: AxiosResponse;
};

export type Cache = Record<string, CacheValue>;

export interface MemoizedValue {
    response: AxiosResponse;
    cache: Cache;
    updated: boolean;
}

export const createKey = (path: string, method: string): string => `${path}#${method}`;
const splitKey = (key: string): [string, string] => R.split('#', key) as [string, string];

export const isExpired = (value: CacheValue, ttl: number): boolean => {
    return (Date.now() - value.timeRetrieved) / 1000 > ttl;
};

export const memoize = async (
    makeRequest: () => Promise<AxiosResponse>,
    cache: Cache,
    key: string,
    ttl = 0,
): Promise<MemoizedValue> => {
    const value = cache[key];
    if (value && !isExpired(value, ttl)) {
        return { response: value.response, cache, updated: false };
    }
    const response = await makeRequest();
    const updatedCache = Object.assign({}, cache, {
        [key]: {
            timeRetrieved: Date.now(),
            response,
        },
    });
    return { response, cache: updatedCache, updated: true };
};

const keyMatchesAnyPath = (paths: string[]) => (key: string) => {
    const pathInKey = R.head(splitKey(key)) ?? '';
    return R.any((path) => matcher.isMatch(pathInKey, path), paths);
};

export const matchingCacheKeys = (cache: Cache, paths: string[]): string[] => {
    const matchingCacheKeys = R.filter(keyMatchesAnyPath(paths), Object.keys(cache));
    return matchingCacheKeys;
};
