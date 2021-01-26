import { expect } from 'chai';
import { Request } from 'express';
import * as Behavior from '../src/Helpers/Behavior';

describe('Scenario: Using behavior helpers', () => {
    describe('Given: a destination and an express request', () => {
        describe('When: I calculate the request parameters', () => {
            const { method, url, ttl, key } = Behavior.requestParameters({ url: 'url', ttl: 0 }, {
                method: 'get',
                path: 'path',
            } as Request);
            it('Then I get back the request method', () => expect(method).to.equal('get'));

            it('And I get back the request url', () => expect(url).to.equal('url/path'));
            it('And I get back the request ttl', () => expect(ttl).to.equal(0));
            it('And I get back the request key', () => expect(key).to.equal('path#get'));
        });
    });
});
