import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { ApiStack } from '../lib/api-stack';
import { DatabaseStack } from '../lib/database-stack';
import { VpcStack } from '../lib/vpc-stack';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'GraphQlPocVpcStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
  },
});

const databaseStack = new DatabaseStack(app, 'GraphQlDatabaseStack', {
  vpc: vpcStack.vpc,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
  },
});

const apiStack = new ApiStack(app, 'GraphQlApiStack', {
  vpc: vpcStack.vpc,
  database: databaseStack.database,
  databaseSecret: databaseStack.databaseSecret,
  databaseSecurityGroup: databaseStack.databaseSecurityGroup,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
  },
});

databaseStack.addDependency(vpcStack);
