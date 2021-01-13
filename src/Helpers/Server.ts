import { Server } from 'http';

export const stopServer = (server: Server): Promise<void> => {
    return new Promise((r) => server.close(() => r()));
};
