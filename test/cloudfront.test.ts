import { expect } from 'chai';
import axios from 'axios';
import HelloWorldServer from './helpers/hello-world-server';
import * as AWS from './helpers/aws';
import Cloudfront from '../src/Cloudfront';

describe('Scenario: I can simulate cloudfront locally', () => {
    describe('Given a cloudfront admin server', () => {
        const port = 3001;
        const helloWorldPort = 4000;
        const cdnPort = 3000;
        let helloWorldServer: HelloWorldServer, cloudfront: Cloudfront;

        before('Start the servers', () => {
            helloWorldServer = new HelloWorldServer(helloWorldPort);
            cloudfront = new Cloudfront({ port });
        });

        after('stop the admin server', async () => {
            await helloWorldServer.stop();
            await cloudfront.stop();
        });

        describe('When I create a local distribution on port 3000', () => {
            const configuration = {
                port: cdnPort,
                behaviors: {
                    '*': {
                        url: `http://localhost:${helloWorldPort}/`,
                        ttl: 500,
                    },
                },
            };
            let response;
            before('create the distribution', async () => {
                response = cloudfront.createDistribution(configuration);
            });
            it('Then I get back a distribution Id', async () => {
                expect(response).to.have.property('distributionId');
            });
            it('And I can describe my distribution by Id', () => {
                const description = cloudfront.describeDistribution(response.distributionId);
                expect(description).to.deep.equal(configuration);
            });
        });

        describe('When I make a request to the Cloudfront CDN Server', () => {
            let response;
            before('make the request', async () => {
                response = await axios.get('http://localhost:3000');
            });
            it('Then my request is forwarded to the hello world server', async () => {
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
            });
            it('And the cache missed', () => {
                expect(response.headers).to.have.property('x-cache-result', 'miss');
            });
        });

        describe('When I use the aws-sdk to create an invalidation for the path "*"', () => {
            let invalidationResponse;
            before('invalidate and request', async () => {
                invalidationResponse = AWS.createInvalidation(['*']);
            });
            it('Then I get back a well formated AWS response', async () => {
                expect(invalidationResponse).to.have.property('status', 200);
                expect(invalidationResponse).to.have.property('data', 'hello world');
            });
            it('And another request to the CDN misses the cache', async () => {
                const response = await axios.get('http://localhost:3000');
                expect(invalidationResponse).to.have.property('status', 200);
                expect(invalidationResponse).to.have.property('data', 'hello world');
                expect(response.headers).to.have.property('x-cache-result', 'miss');
            });
        });
    });
});
