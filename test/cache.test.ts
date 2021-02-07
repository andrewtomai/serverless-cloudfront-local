import { expect } from 'chai';
import { AxiosResponse } from 'axios';
import * as Cache from '../src/Helpers/Cache';

describe('Scenario: Using cache helpers', () => {
    describe('Given: a cache value', () => {
        describe('When: I check to see if the cache value is expired', () => {
            it('Then I get true if the value is expired', () =>
                expect(Cache.isExpired({ timeRetrieved: 1, response: {} as AxiosResponse }, 100)));
            it('And I get false if the value is not expired', () =>
                expect(Cache.isExpired({ timeRetrieved: Date.now(), response: {} as AxiosResponse }, 100)));
        });
    });

    describe.only('Given: a cache, and a function to memoize with the cache', () => {
        const cache = {
            key: {
                timeRetrieved: Date.now(),
                response: ('value' as unknown) as AxiosResponse,
            },
        };
        const fnToMemoize = async () => ('new value' as unknown) as AxiosResponse;
        describe('When the cached value is not expired', () => {
            it('Then I back the cached value', async () => {
                const { responseWasCached, cache: updatedCache, response } = await Cache.memoize(
                    fnToMemoize,
                    cache,
                    'key',
                    'GET',
                    100,
                );
                expect(responseWasCached).to.equal(true, 'The response should be cached.');
                expect(updatedCache).to.deep.equal(cache, 'The cache has been incorrectly updated');
                expect(response).to.equal('value', 'Did not get back the cached value');
            });
        });
        describe('When the cached value is expired', () => {
            it('Then I get back a new value and the cache it is updated', async () => {
                const { responseWasCached, cache: updatedCache, response } = await Cache.memoize(
                    fnToMemoize,
                    cache,
                    'key',
                    'GET',
                    0,
                );
                expect(responseWasCached).to.equal(false, 'The response should not be cached');
                expect(updatedCache).to.not.deep.equal(cache, 'The cache has not been updated');
                expect(response).to.equal('new value', 'Did not get back the new value');
            });
        });
        describe('When the cached value is missing', () => {
            it('Then I get back a new value and the cache it is updated', async () => {
                const { responseWasCached, cache: updatedCache, response } = await Cache.memoize(
                    fnToMemoize,
                    cache,
                    'key2',
                    'GET',
                    0,
                );
                expect(responseWasCached).to.equal(false, 'Response should not be cached');
                expect(updatedCache).to.deep.include(cache, 'The cache is missing the other cached value');
                expect(response).to.equal('new value', 'Did not get back the new value');
            });
        });
        describe('When the function to memoize returns the "no-cache" header', async () => {
            const noCacheFn = async () => (({ headers: { 'cache-control': 'no-cache' } } as unknown) as AxiosResponse);
            it('Then I get back my expected value, and the cache was not updated', async () => {
                const { responseWasCached, cache: updatedCache, response } = await Cache.memoize(
                    noCacheFn,
                    cache,
                    'no-cache-key',
                    'GET',
                    500,
                );
                expect(responseWasCached).to.equal(false, 'Response should not be cached');
                expect(updatedCache).to.deep.include(cache, 'The cache should not be updated');
                expect(response).to.deep.equal(
                    { headers: { 'cache-control': 'no-cache' } },
                    'Did not get back the new value',
                );
            });
        });
        describe('When the http method is not GET, HEAD, or OPTIONS', async () => {
            it('Then I get back my expected value, and the cache was not updated', async () => {
                const { responseWasCached, cache: updatedCache, response } = await Cache.memoize(
                    fnToMemoize,
                    cache,
                    'no-cache-key',
                    'POST',
                    500,
                );
                expect(responseWasCached).to.equal(false, 'Response should not be cached');
                expect(updatedCache).to.deep.include(cache, 'The cache should not be updated');
                expect(response).to.equal('new value', 'Did not get back the new value');
            });
        });
    });

    describe('Given: a cache', () => {
        const cache = ({
            '/hello#GET': {},
            '/world.jpg#POST': {},
            '/world.jpg#HEAD': {},
        } as unknown) as Cache.Cache;
        describe('When: I find the cache keys matching a specific path', () => {
            const paths = ['/world.jpg'];
            it('Then I get back cache keys with only the specific path', () => {
                const actual = Cache.matchingCacheKeys(cache, paths);
                expect(actual).to.deep.equal(['/world.jpg#POST', '/world.jpg#HEAD']);
            });
        });
        describe('When: I find the cache keys matching wildcarded path', () => {
            const paths = ['/*'];
            it('Then I get back cache keys with only the specific path', () => {
                const actual = Cache.matchingCacheKeys(cache, paths);
                expect(actual).to.deep.equal(['/hello#GET', '/world.jpg#POST', '/world.jpg#HEAD']);
            });
        });
        describe('When: I find the cache keys matching a two specific paths', () => {
            const paths = ['/hello', '/world.jpg'];
            it('Then I get back cache keys with only the specific path', () => {
                const actual = Cache.matchingCacheKeys(cache, paths);
                expect(actual).to.deep.equal(['/hello#GET', '/world.jpg#POST', '/world.jpg#HEAD']);
            });
        });
    });
});
