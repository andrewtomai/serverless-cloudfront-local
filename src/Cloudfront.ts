import * as express from 'express';
import * as R from 'ramda';
import { Server } from 'http';
import { Chance } from 'chance';
import CdnServer, { Configuration as CdnConfigration } from './CdnServer';
import { stopServer } from './Helpers/Server';

interface Configuration {
    port?: number;
}

const generateDistributionId = () => {
    const chance = Chance();
    return `E${chance.string({ length: 13, casing: 'upper', alpha: true, numeric: true })}`;
};

interface Distribution {
    server: CdnServer;
    configuration: CdnConfigration;
    distributionId: string;
    running: boolean;
}

class Cloudfront {
    private adminServer: Server;
    private distributions: {
        [prop: string]: Distribution;
    };

    constructor(config: Configuration) {
        const { port = 4000 } = config;
        const app = express();
        this.distributions = {};
        this.adminServer = app.listen(port);
    }

    createDistribution = (config: CdnConfigration): Distribution => {
        const distributionId = generateDistributionId();
        const server = new CdnServer(config);
        const distribution = {
            distributionId,
            configuration: config,
            server: server,
            running: true,
        };
        this.distributions = R.assoc(distributionId, distribution, this.distributions);
        return distribution;
    };

    describeDistribution = (distributionId: string): Distribution | undefined => {
        return R.prop(distributionId, this.distributions);
    };

    stopDistribution = async (distributionId: string): Promise<void> => {
        const distribution = R.prop(distributionId, this.distributions);
        if (distribution.running) {
            this.distributions = R.set(R.lensPath([distributionId, 'running']), false, this.distributions);
            await distribution.server.stop();
        }
    };

    private stopDistributions = async (): Promise<void> => {
        const distributionIds = Object.keys(this.distributions);
        await Promise.all(R.map(this.stopDistribution, distributionIds));
    };

    stop = async (): Promise<void> => {
        await Promise.all([stopServer(this.adminServer), this.stopDistributions()]);
    };
}

export default Cloudfront;
