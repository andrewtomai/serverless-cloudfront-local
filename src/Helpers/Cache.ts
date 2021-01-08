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
