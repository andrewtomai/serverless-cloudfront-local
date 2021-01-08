import { expect } from 'chai';
import axios from 'axios';
import HelloWorldServer from './helpers/hello-world-server';
import CdnServer from '../src/CdnServer';

describe('Scenario: I can use the server as a cdn like cloudfront', () => {
    describe('Given a configuration proxying requests to a server on port 4000', () => {
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
        describe('When I start the local cloudfront server', () => {
            let helloWorldServer: HelloWorldServer, cdnServer: CdnServer;
            before('Start the hello world server', () => {
                helloWorldServer = new HelloWorldServer(helloWorldPort);
            });

            after('Stop the servers', async () => {
                await cdnServer.stop();
            });

            it('Then I can send a request to the hello world server', async () => {
                const response = await axios.get('http://localhost:4000');
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
            });

            it('And I can start the cdn', () => {
                cdnServer = new CdnServer(configuration);
            });

            it('And when I send a request to the Cdn, it forwards the request to hello world server', async () => {
                const response = await axios.get('http://localhost:3000');
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
                expect(response.headers).to.have.property('x-cache-result', 'miss');
            });

            it('And after I stop the hello world server, I get the cached result', async () => {
                await helloWorldServer.stop();
                const response = await axios.get('http://localhost:3000');
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
                expect(response.headers).to.have.property('x-cache-result', 'hit');
            });
        });
    });
});
