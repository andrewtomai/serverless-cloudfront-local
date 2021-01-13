// var params = {
//     DistributionId: 'STRING_VALUE', /* required */
//     InvalidationBatch: { /* required */
//       CallerReference: 'STRING_VALUE', /* required */
//       Paths: { /* required */
//         Quantity: 'NUMBER_VALUE', /* required */
//         Items: [
//           'STRING_VALUE',
//           /* more items */
//         ]
//       }
//     }
//   };
//   cloudfront.createInvalidation(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });

import { CloudFront, Endpoint } from 'aws-sdk';

const cloudfrontClient = ({ port = 3000 } = {}): CloudFront => {
    const cloudfront = new CloudFront({
        accessKeyId: 'ACCESS',
        secretAccessKey: 'SECRET',
        endpoint: new Endpoint(`http://localhost:${port}`),
    });
    return cloudfront;
};

export const createInvalidation = async (paths: string[], { port }: { port?: number } = {}): Promise<void> => {
    const cloudfront = cloudfrontClient({ port });
    await cloudfront
        .createInvalidation({
            DistributionId: 'something',
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
