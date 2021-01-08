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

    describe('Given: a cache, and a function to memoize with the cache', () => {
        const cache = {
            key: {
                timeRetrieved: Date.now(),
                response: ('value' as unknown) as AxiosResponse,
            },
        };
        const fnToMemoize = async () => ('new value' as unknown) as AxiosResponse;
        describe('When the cached value is not expired', () => {
            it('Then I back the cached value', async () => {
                const { updated, cache: updatedCache, response } = await Cache.memoize(fnToMemoize, cache, 'key', 100);
                expect(updated).to.equal(false, 'The cache has been incorrectly updated');
                expect(updatedCache).to.deep.equal(cache, 'The cache has been incorrectly updated');
                expect(response).to.equal('value', 'Did not get back the cached value');
            });
        });
        describe('When the cached value is expired', () => {
            it('Then I get back a new value and the cache it is updated', async () => {
                const { updated, cache: updatedCache, response } = await Cache.memoize(fnToMemoize, cache, 'key', 0);
                expect(updated).to.equal(true, 'The cache has not been updated');
                expect(updatedCache).to.not.deep.equal(cache, 'The cache has not been updated');
                expect(response).to.equal('new value', 'Did not get back the new value');
            });
        });
        describe('When the cached value is missing', () => {
            it('Then I get back a new value and the cache it is updated', async () => {
                const { updated, cache: updatedCache, response } = await Cache.memoize(fnToMemoize, cache, 'key2', 0);
                expect(updated).to.equal(true, 'The cache has not been updated');
                expect(updatedCache).to.deep.include(cache, 'The cache is missing the other cached value');
                expect(response).to.equal('new value', 'Did not get back the new value');
            });
        });
    });
});
