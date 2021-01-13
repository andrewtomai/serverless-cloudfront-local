import { expect } from 'chai';
import axios from 'axios';
import HelloWorldServer from './helpers/hello-world-server';
import CdnServer from '../src/CdnServer';

describe('Scenario: I can use a server as a cdn like cloudfront', () => {
    describe('Given a CDN server proxying requests to a "hello world" server on port 4000', () => {
        const helloWorldPort = 4000;
        const cdnPort = 3000;
        const configuration = {
            port: cdnPort,
            behaviors: {
                '*': {
                    url: `http://localhost:${helloWorldPort}/`,
                    ttl: 500,
                },
            },
        };

        let helloWorldServer: HelloWorldServer, cdnServer: CdnServer;

        before('Start the hello world server', () => {
            helloWorldServer = new HelloWorldServer(helloWorldPort);
            cdnServer = new CdnServer(configuration);
        });

        after('stop the servers', async () => {
            await cdnServer.stop();
        });

        describe('When I make a request to the CDN Server', () => {
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

        describe('When I invalidate the CDN Server with the path"*"', () => {
            let response;
            before('invalidate and request', async () => {
                cdnServer.invalidate('*');
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

        describe('When I shut down the hello world server', () => {
            let response;
            before('invalidate and request', async () => {
                await helloWorldServer.stop();
                response = await axios.get('http://localhost:3000');
            });
            it('Then my request is not forwarded, and the response is cached', async () => {
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
            });
            it('And the cache hit', () => {
                expect(response.headers).to.have.property('x-cache-result', 'hit');
            });
        });
    });
});
