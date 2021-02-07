import * as express from 'express';
import * as R from 'ramda';
import axios from 'axios';
import { Server } from 'http';
import * as Behavior from './Helpers/Behavior';
import * as Cache from './Helpers/Cache';
import { stopServer } from './Helpers/Server';

export interface Configuration {
    behaviors: Behavior.Behaviors;
    port: number;
}

class CdnServer {
    private server: Server;
    cache: Cache.Cache;

    constructor(config: Configuration) {
        const { behaviors, port } = config;
        this.cache = {};
        const app = express();
        R.forEach(this.proxyBehavior(app), Object.entries(behaviors));
        this.server = app.listen(port);
    }

    private proxyBehavior = (app: express.Application) => (behavior: [string, Behavior.Destination]) => {
        const [path, destination] = behavior;
        app.all(path, async (req, res) => {
            try {
                const { method, url, key, ttl } = Behavior.requestParameters(destination, req);
                const makeRequest = () => axios({ method, url, validateStatus: null });
                // make the request, using the cache to check for previous answers
                const { cache, response, responseWasCached } = await Cache.memoize(
                    makeRequest,
                    this.cache,
                    key,
                    method,
                    ttl,
                );
                // update the cache with any new values
                this.cache = cache;
                // send the response
                res.set('x-cache-result', responseWasCached ? 'hit' : 'miss');
                res.set(response.headers).status(response.status).send(response.data);
            } catch (err) {
                res.send(err);
            }
        });
    };

    invalidate = (...paths: string[]): void => {
        const matchingCacheKeys = Cache.matchingCacheKeys(this.cache, paths);
        this.cache = R.omit(matchingCacheKeys, this.cache);
    };

    stop = async (): Promise<void> => {
        return stopServer(this.server);
    };
}

export default CdnServer;
