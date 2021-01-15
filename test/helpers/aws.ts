import { CloudFront, Endpoint } from 'aws-sdk';

const cloudfrontClient = ({ port = 3000 } = {}): CloudFront => {
    const cloudfront = new CloudFront({
        accessKeyId: 'ACCESS',
        secretAccessKey: 'SECRET',
        endpoint: new Endpoint(`http://localhost:${port}`),
        region: 'us-west-2',
    });
    return cloudfront;
};

export const createInvalidation = async (
    distributionId: string,
    paths: string[],
    { port }: { port?: number } = {},
): Promise<any> => {
    const cloudfront = cloudfrontClient({ port });
    return cloudfront
        .createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: `${Date.now()}`,
                Paths: {
                    Quantity: paths.length,
                    Items: paths,
                },
            },
        })
        .promise();
};
