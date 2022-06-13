const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');
const Mustache = require('mustache');

class ServerlessAWSFunctionURLCustomDomainPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:finalize': this.createDeploymentArtifacts.bind(this),
      'aws:info:displayStackOutputs': this.printSummary.bind(this),
    };
  }

  createDeploymentArtifacts() {
    const baseResources = this.serverless.service.provider.compiledCloudFormationTemplate;

    var functionURLResourceName = null;
    for(var key in baseResources.Resources) {
      if (baseResources.Resources[key]['Type'] === "AWS::Lambda::Url") {
        functionURLResourceName = key
      }
    }

    if (functionURLResourceName === null) {
      this.serverless.cli.consoleLog("no function url defined");
      return baseResources;
    }
    
    const config = this.serverless.service.custom.urlDomain;
    config['lambdaFunctionUrl'] = functionURLResourceName

    const resources = this.prepareResources(config);

    const combinedResouces = _.merge(baseResources, resources);
    console.log(JSON.stringify(combinedResouces));

    return combinedResouces;
  }

  printSummary() {

    const awsInfo = _.find(this.serverless.pluginManager.getPlugins(), (plugin) => plugin.constructor.name === 'AwsInfo');

    if (!awsInfo || !awsInfo.gatheredData) {
      return;
    }

    const { outputs } = awsInfo.gatheredData;
    const apiDistributionDomain = _.find(outputs, (output) => output.OutputKey === 'CloudFrontDistributionDomain');

    if (!apiDistributionDomain || !apiDistributionDomain.OutputValue) {
      return;
    }

    const cnameDomain = this.getConfig('apiDomain', '-');

    this.serverless.cli.consoleLog('CloudFront domain name');
    this.serverless.cli.consoleLog(`${apiDistributionDomain.OutputValue} (CNAME: ${cnameDomain})`);
  }

  prepareResources(config) {

    const route53 = this.getConfig('route53', true);
    var resources = this.getCloudfrontResources(config);
    if (route53) {
      resources = _.merge(resources, this.getRoute53Resources(config));
    }
    return resources
  }

  getCloudfrontResources(config) {
    const filename = path.resolve(__dirname, 'resources.yml');
    const content = fs.readFileSync(filename, 'utf-8');
    const resources = yaml.load(content, {
      filename,
    });
    var output = Mustache.render(JSON.stringify(resources), config);
    output = JSON.parse(output)
    output['Resources']['CloudFrontDistribution']['Properties']['DistributionConfig']['Aliases'] = config['domains']
    return output;
  }

  getRoute53Resources(config) {
    const domains = this.getConfig('domains', null);
    const hostedZoneName = this.getConfig('hostedZoneName', null);

    const template = JSON.stringify({
      "Type": "AWS::Route53::RecordSetGroup",
      "DeletionPolicy": "Delete",
      "DependsOn": [
        "CloudFrontDistribution"
      ],
      "Properties": {
        "HostedZoneName": hostedZoneName,
        "RecordSets": [
          {
            "Name": "{{{ domain }}}",
            "Type": "A",
            "AliasTarget": {
              "HostedZoneId": "Z2FDTNDATAQYW2",
              "DNSName": {
                "Fn::GetAtt": [
                  "CloudFrontDistribution",
                  "DomainName"
                ]
              }
            }
          }
        ]
      }
    })
    var resources = {}
    for (var idx in domains) {
      var output = Mustache.render(template, {'domain': domains[idx]});
      resources[`Route53Record${idx}`] = JSON.parse(output);
    }
    return {'Resources': resources}
  }

  getConfig(field, defaultValue) {
    return _.get(this.serverless, `service.custom.urlDomain.${field}`, defaultValue);
  }
}

module.exports = ServerlessAWSFunctionURLCustomDomainPlugin;
