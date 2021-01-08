import * as express from 'express';
import { Server } from 'http';

class HelloWorldServer {
    private server: Server;

    constructor(port = 4000) {
        const app = express();
        app.all('*', (req, res) => {
            res.send('hello world');
        });
        this.server = app.listen(port);
    }

    stop = async (): Promise<void> => {
        return new Promise((r) => this.server.close(() => r()));
    };
}

export default HelloWorldServer;
