[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)]([https://raw.githubusercontent.com/Droplr/serverless-api-cloudfront/master/LICENSE](https://raw.githubusercontent.com/wangsha/serverless-aws-function-url-custom-domain/main/LICENSE))
[![npm version](https://badge.fury.io/js/serverless-aws-function-url-custom-domain.svg)](https://badge.fury.io/js/serverless-aws-function-url-custom-domain)


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
    apiDomain: ${env:SUBDOMAIN}.yourdomain.com  # change by your custom domain
    hostedZoneName: yourdomain.com.  # your domain Route 53 hosted zone name
    certificateArn: 'arn:aws:acm:us-east-1:xxxxx:certificate/xxxxx' # need to be located at NVirgina 
    
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

```
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
* `acm:ListCertificates`
* `route53:ListHostedZones`             
* `route53:ChangeResourceRecordSets`
* `route53:GetHostedZone`
* `route53:ListResourceRecordSets` 

You can read more about IAM profiles and policies in the [Serverless documentation](https://serverless.com/framework/docs/providers/aws/guide/credentials#creating-aws-access-keys).


## References
- [serverless framework example integration](https://medium.com/@walid.karray/configuring-a-custom-domain-for-aws-lambda-function-url-with-serverless-framework-c0d78abdc253)
- [AWS Lambda Function URLs](https://aws.amazon.com/fr/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/)

