import * as express from 'express';
import { Server } from 'http';
import CdnServer from './CdnServer';
import { stopServer } from './Helpers/Server';

interface Configuration {
    port?: number;
}

class Cloudfront {
    private adminServer: Server;
    private distributions: CdnServer[];

    constructor(inputConfiguration: Configuration) {
        const { port = 4000 } = inputConfiguration;
        const app = express();
        this.adminServer = app.listen(port);
    }

    private stopDistributions = async (): Promise<void> => {
        await Promise.all(this.distributions.map((d) => d.stop()));
    };

    stop = async (): Promise<void> => {
        await Promise.all([stopServer(this.adminServer), this.stopDistributions()]);
    };
}

export default Cloudfront;
