# Serverless Cloudfront Local Plugin

<p>
  <a href="https://www.serverless.com">
    <img src="http://public.serverless.com/badges/v3.svg">
  </a>
  <a href="https://www.npmjs.com/package/serverless-cloudfront-local">
    <img src="https://img.shields.io/npm/v/serverless-cloudfront-local.svg?style=flat-square">
  </a>
  <a href="https://github.com/serverless/serverless">
    <img src="https://img.shields.io/npm/dependency-version/serverless-cloudfront-local/peer/serverless.svg?style=flat-square">
  </a>
  <a href="https://github.com/dherault/serverless-offline">
    <img src="https://img.shields.io/npm/dependency-version/serverless-cloudfront-local/peer/serverless-offline.svg?style=flat-square">
  </a>
  <img src="https://img.shields.io/npm/l/serverless-cloudfront-local.svg?style=flat-square">
  <a href="#contributing">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
  </a>
</p>

Currently, there's no easy way to simulate a cloudfront distribution defined in your serverless configuration.  This plugin attempts to solve that problem, and works well with [serverless-offline](https://github.com/dherault/serverless-offline)

## Intalling
Add this package to your project's development dependencies:
```
$ yarn add --dev serverless-cloudfront-local 
``` 
```
$ npm install --save-dev serverless-cloudfront-local 
```

After installing, add the plugin to your `serverless.yml`:
```yaml
...
plugins:
    - serverless-cloudfront-local
    - serverless-offline
...
```

## Usage
This plugin works by inspecting your `serverless.yml` to find a cloudfront definition.  Using this definition, and a provided configuration, it launches two local servers.

1. A server to behave like a CDN -- it caches responses from your serverless offline server
2. A server to behave like the AWS Cloudfront API for interacting with your cloudfront distribution


## Supported Cloudfront Operations
- [createInvalidation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFront.html#createInvalidation-property)

## Configuration