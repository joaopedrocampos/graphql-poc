import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  database: rds.DatabaseInstance;
  databaseSecret: secretsmanager.Secret;
  databaseSecurityGroup: ec2.SecurityGroup;
}

export class ApiStack extends cdk.Stack {
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from internet',
    );

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet',
    );

    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for ECS tasks',
      allowAllOutbound: true,
    });

    ecsSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(8000), 'Allow traffic from ALB');

    props.databaseSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow access from VPC',
    );

    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    this.loadBalancer = loadBalancer;

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: 'graphql-poc-cluster',
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'FargateTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    const container = taskDefinition.addContainer('GraphQLContainer', {
      image: ecs.ContainerImage.fromAsset('../'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'graphql-poc',
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '8000',
        DB_HOST: props.database.instanceEndpoint.hostname,
        DB_PORT: props.database.instanceEndpoint.port.toString(),
        DB_NAME: 'graphql_poc',
      },
      secrets: {
        DB_USER: ecs.Secret.fromSecretsManager(props.databaseSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(props.databaseSecret, 'password'),
      },
    });

    container.addPortMappings({
      containerPort: 8000,
      protocol: ecs.Protocol.TCP,
    });

    const service = new ecs.FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      securityGroups: [ecsSecurityGroup],
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ApplicationTargetGroup', {
      vpc: props.vpc,
      port: 8000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/graphql',
        healthyHttpCodes: '200',
      },
    });

    service.attachToApplicationTargetGroup(targetGroup);

    const listener = loadBalancer.addListener('Listener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    new cdk.CfnOutput(this, 'LoadBalanceUrl', {
      value: `http://${loadBalancer.loadBalancerDnsName}`,
      description: 'Load Balancer URL',
    });
  }
}
