import { expect } from 'chai';
import axios from 'axios';
import HelloWorldServer from './helpers/hello-world-server';

describe('Scenario: I can use the hello world server in tests', () => {
    describe('Given a "hello world" server on port 4000', () => {
        const helloWorldPort = 4000;

        let helloWorldServer: HelloWorldServer;
        before('Start the hello world server', () => {
            helloWorldServer = new HelloWorldServer(helloWorldPort);
        });

        after('stop the servers', async () => {
            await helloWorldServer.stop();
        });

        describe('When I make a request to the hello world server', () => {
            it('Then I get back the hello world response', async () => {
                const response = await axios.get('http://localhost:4000');
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
            });
        });
        describe('When I make a request to the hello world server at the "/no-cache" path', () => {
            it('Then I get back the hello world response, with the no-cache header', async () => {
                const response = await axios.get('http://localhost:4000/no-cache');
                expect(response).to.have.property('status', 200);
                expect(response).to.have.property('data', 'hello world');
                expect(response.headers).to.have.property('cache-control', 'no-cache');
            });
        });
    });
});
