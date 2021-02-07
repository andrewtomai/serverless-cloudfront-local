import { expect } from 'chai';
import axios from 'axios';
import HelloWorldServer from './helpers/hello-world-server';
import * as AWS from './helpers/aws';
import Cloudfront from '../src/Cloudfront';

describe('Scenario: I can simulate cloudfront locally', () => {
    describe('Given a cloudfront admin server', () => {
        const port = 3000;
        const helloWorldPort = 4000;
        const cdnPort = 3002;

        const distributionConfig = {
            port: cdnPort,
            behaviors: {
                '*': {
                    url: `http://localhost:${helloWorldPort}/`,
                    ttl: 500,
                },
            },
        };

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
            let distribution;

            before('create the distribution', async () => {
                distribution = cloudfront.createDistribution(distributionConfig);
            });
            it('Then I get back a Distribution Id', async () => {
                expect(distribution).to.have.property('distributionId');
            });

            it('And I can describe my Distribution by Id', () => {
                const description = cloudfront.describeDistribution(distribution.distributionId);
                expect(description).to.deep.include({
                    distributionId: distribution.distributionId,
                    configuration: distributionConfig,
                    running: true,
                });
            });
            it('And requests to the Distribution are proxied to the hello world server', async () => {
                const response = await axios.get(`http://localhost:${cdnPort}`);
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
                expect(response.headers).to.have.property('x-cache-result', 'miss');
            });

            it('And I can stop the Distribution', async () => {
                await cloudfront.stopDistribution(distribution.distributionId);
                const description = cloudfront.describeDistribution(distribution.distributionId);
                expect(description).to.have.property('running', false);
            });
        });

        describe('When I use the aws-sdk to create an invalidation for the path "*"', () => {
            let distribution;
            before('create the distribution, and load a response into the cache', async () => {
                distribution = cloudfront.createDistribution(distributionConfig);
                await axios.get(`http://localhost:${cdnPort}`);
            });
            it('And I can use the aws-sdk to create an invalidation for the path "*"', async () => {
                const invalidationResponse = await AWS.createInvalidation(distribution.distributionId, ['*'], {
                    port,
                });
                expect(invalidationResponse).to.have.property('Invalidation');
            });

            it('And the invalidation causes the cache to miss', async () => {
                const response = await axios.get(`http://localhost:${cdnPort}`);
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
                expect(response.headers).to.have.property('x-cache-result', 'miss');
            });
        });
    });
});
