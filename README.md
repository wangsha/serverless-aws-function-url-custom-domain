[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)]([https://raw.githubusercontent.com/Droplr/serverless-api-cloudfront/master/LICENSE](https://raw.githubusercontent.com/wangsha/serverless-aws-function-url-custom-domain/main/LICENSE))
[![npm version](https://badge.fury.io/js/serverless-aws-function-url-custom-domain.svg)](https://badge.fury.io/js/serverless-aws-function-url-custom-domain)
[![npm downloads](https://img.shields.io/npm/dt/serverless-aws-function-url-custom-domain.svg?style=flat)](https://www.npmjs.com/package/serverless-aws-function-url-custom-domain)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit)


# serverless-aws-function-url-custom-domain

Automatically creates AWS CloudFront distribution and Route 53 records to AWS Lambda with [Function URL](https://aws.amazon.com/fr/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/) (no api gateway).

## Installation
```bash
npm install --save-dev serverless-aws-function-url-custom-domain
```

## Configuration
This plugin assumes your domain is hosted and managed with AWS Route53. SSL certificate is managed via certificate manager.

```yaml
# add in your serverless.yml

plugins:
  - serverless-aws-function-url-custom-domain


custom:
  urlDomain:
    domains:
      - ${env:SUBDOMAIN}.yourdomain.com  # custom domain 1
      - ${env:SUBDOMAIN}-alt.yourdomain.com  # custom domain 2
    hostedZoneName: yourdomain.com.  # your domain Route 53 hosted zone name
    certificateArn: 'arn:aws:acm:us-east-1:xxxxx:certificate/xxxxx' # need to be located at NVirgina
    route53: false # disable route 53 integration
functions:
  api:
    handler: wsgi_handler.handler
    url: true # activate function URL!

```

### Deploy
```javascript
serverless deploy
```

### Inspect Result
```javascript
serverless info --verbose
```

```bash
Output:


CloudFront domain name
  xxxxx.cloudfront.net (CNAME: ${env:SUBDOMAIN}.yourdomain.com)

```

### IAM Policy

In order to make this plugin work as expected a few additional IAM Policies might be needed on your AWS profile.

More specifically this plugin needs the following policies attached:

  * `cloudfront:CreateDistribution`
  * `cloudfront:GetDistribution`
  * `cloudfront:UpdateDistribution`
  * `cloudfront:DeleteDistribution`
  * `cloudfront:TagResource`
  * `route53:ListHostedZones`
  * `route53:ChangeResourceRecordSets`
  * `route53:GetHostedZone`
  * `route53:ListResourceRecordSets`
  * `acm:ListCertificates`

You can read more about IAM profiles and policies in the [Serverless documentation](https://serverless.com/framework/docs/providers/aws/guide/credentials#creating-aws-access-keys).


## References
  - [serverless framework example integration](https://medium.com/@walid.karray/configuring-a-custom-domain-for-aws-lambda-function-url-with-serverless-framework-c0d78abdc253)
  - [AWS Lambda Function URLs](https://aws.amazon.com/fr/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/)
