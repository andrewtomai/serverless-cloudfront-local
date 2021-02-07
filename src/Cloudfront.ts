import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as parser from 'fast-xml-parser';
import * as R from 'ramda';
import { Server } from 'http';
import { Chance } from 'chance';
import CdnServer, { Configuration as CdnConfigration } from './CdnServer';
import { stopServer } from './Helpers/Server';

interface Configuration {
    port: number;
}

interface Distribution {
    server: CdnServer;
    configuration: CdnConfigration;
    distributionId: string;
    running: boolean;
}

interface InvalidateBatchRequestBody {
    InvalidationBatch: {
        Paths: {
            Quantity: number;
            Items: {
                Path: string | string[];
            };
        };
        CallerReference: string | number;
    };
}

const generateDistributionId = () => {
    const chance = Chance();
    return `E${chance.string({ length: 13, casing: 'upper', alpha: true, numeric: true })}`;
};

const generateInvalidationId = () => {
    const chance = Chance();
    return `I${chance.string({ length: 13, casing: 'upper', alpha: true, numeric: true })}`;
};

const xmlParserMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const parsedBody = parser.parse(req.body.toString());
    req.body = parsedBody;
    next();
};

const createXmlApp = () => {
    const app = express();
    app.use(bodyParser.raw({ type: () => true }));
    app.use(xmlParserMiddleware);
    return app;
};

const distributionIdFromPath = (path: string) => R.nth(3, R.split('/', path));

const pathsFromBody = (body: InvalidateBatchRequestBody): string[] => {
    const paths = body.InvalidationBatch.Paths.Items.Path;
    if (Array.isArray(paths)) return paths;
    return [paths];
};

const xmlResponse = (obj: Record<string, unknown>) => {
    const j2xParser = new parser.j2xParser({});
    const xml = j2xParser.parse(obj);
    return xml;
};

class Cloudfront {
    private adminServer: Server;
    private distributions: {
        [prop: string]: Distribution;
    };

    constructor(config: Configuration) {
        const { port } = config;
        const app = this.createAdminApp();
        this.distributions = {};
        this.adminServer = app.listen(port);
    }

    private createAdminApp = () => {
        const app = createXmlApp();
        app.all('*', (req, res) => {
            const distributionId = distributionIdFromPath(req.path);
            const body = req.body as InvalidateBatchRequestBody;
            const paths = pathsFromBody(body);
            this.invalidateDistribution(distributionId!, paths);
            const response = {
                Invalidation: {
                    CreateTime: Date.now(),
                    Id: generateInvalidationId(),
                    InvalidationBatch: {
                        CallerReference: body.InvalidationBatch.CallerReference,
                        Paths: body.InvalidationBatch.Paths,
                    },
                    Status: 'Completed',
                },
            };
            res.status(201).send(xmlResponse(response));
        });
        return app;
    };

    private invalidateDistribution = (distributionId: string, paths: string[]) => {
        const distribution = this.describeDistribution(distributionId);
        distribution?.server.invalidate(...paths);
    };

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
