import * as express from 'express';
import * as R from 'ramda';
import * as matcher from 'matcher';
import axios from 'axios';
import { Server } from 'http';
import * as Behavior from './Helpers/Behavior';
import * as Cache from './Helpers/Cache';

interface Configuration {
    behaviors: Behavior.Behaviors;
    port?: number;
}

class CdnServer {
    private server: Server;
    cache: Cache.Cache;

    constructor(inputConfiguration: Configuration) {
        const { behaviors, port = 4000 } = inputConfiguration;
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
                const { cache, response, updated } = await Cache.memoize(makeRequest, this.cache, key, ttl);
                // update the cache with any new values
                this.cache = cache;
                // send the response
                res.set('x-cache-result', updated ? 'miss' : 'hit');
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
        return new Promise((r) => this.server.close(() => r()));
    };
}

export default CdnServer;
