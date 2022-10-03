var assert = require('assert');
describe('Array', function () {
  describe('#getCloudfrontResources()', function () {
    it('domains should be a list', function () {
      const ServerlessAWSFunctionURLCustomDomainPlugin = require('./index')
      config = {
        domains: ['sudomain1.yourdomain.com', 'subdomain2.yourdomain.com'],
        hostedZoneName: 'yourdomain.com.',
        certificateArn: 'arn:aws:acm:us-east-1:xxxxx:certificate/xxxxxxx',
        route53: true
      }
      var plugin = new ServerlessAWSFunctionURLCustomDomainPlugin();
      var resources = plugin.getCloudfrontResources(config);
      console.log(resources['Resources']['CloudFrontDistribution']['Properties']['DistributionConfig']['Comment'])
      assert(resources['Resources']['CloudFrontDistribution']['Properties']['DistributionConfig']['Aliases'] == config['domains']);

    });
  });
});
