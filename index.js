'use strict';


   
const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');

class ServerlessAWSFunctionURLCustomDomainPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.createDeploymentArtifacts.bind(this),
      'aws:info:displayStackOutputs': this.printSummary.bind(this),
    };
  }

  createDeploymentArtifacts() {
    const baseResources = this.serverless.service.provider.compiledCloudFormationTemplate;

    const filename = path.resolve(__dirname, 'resources.yml');
    const content = fs.readFileSync(filename, 'utf-8');
    const resources = yaml.load(content, {
      filename: filename
    });

    this.prepareResources(resources);
    const combinedResouces = _.merge(baseResources, resources);
    return combinedResouces;

  }

  printSummary() {
    const cloudTemplate = this.serverless;

    const awsInfo = _.find(this.serverless.pluginManager.getPlugins(), (plugin) => {
      return plugin.constructor.name === 'AwsInfo';
    });

    if (!awsInfo || !awsInfo.gatheredData) {
      return;
    }

    const outputs = awsInfo.gatheredData.outputs;
    const apiDistributionDomain = _.find(outputs, (output) => {
      return output.OutputKey === 'ApiCloudFrontDistributionDomain';
    });

    if (!apiDistributionDomain || !apiDistributionDomain.OutputValue) {
      return ;
    }

    const cnameDomain = this.getConfig('apiDomain', '-');

    this.serverless.cli.consoleLog('CloudFront domain name');
    this.serverless.cli.consoleLog(`  ${apiDistributionDomain.OutputValue} (CNAME: ${cnameDomain})`);
  }


  prepareResources(resources) {
    const distributionConfig = resources.Resources.ApiCloudFrontDistribution.Properties.DistributionConfig;
    const apiRecordsConfig = resources.Resources.ApiRecordSetGroup.Properties;
    this.prepareDomain(distributionConfig, apiRecordsConfig);
    this.prepareAcmCertificateArn(distributionConfig);
    this.prepareHostedZoneName(apiRecordsConfig);

  }
  prepareHostedZoneName(apiRecordsConfig) {
    const name = this.getConfig('hostedZoneName', null);

    apiRecordsConfig.HostedZoneName = name;
  }
  prepareAcmCertificateArn(distributionConfig) {
    const arn = this.getConfig('certificateNVirginaArn', null);
    distributionConfig.ViewerCertificate.AcmCertificateArn = arn;
  }

  prepareDomain(distributionConfig, apiRecordsConfig) {
    const domain = this.getConfig('apiDomain', null);

    if (domain !== null) {
      const domains = Array.isArray(domain) ? domain : [ domain ]
      distributionConfig.Aliases = domains;
      apiRecordsConfig.RecordSets[0].Name =  domains[0];
      distributionConfig.Comment = 'Api distribution for ' + domains[0];
    } else {
      delete distributionConfig.Aliases;
    }
  }

  


  getConfig(field, defaultValue) {
    return _.get(this.serverless, `service.custom.urlDomain.${field}`, defaultValue)
  }

}

module.exports = ServerlessAWSFunctionURLCustomDomainPlugin;
