/* eslint-disable no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as aws from '@pulumi/aws'
import type { EngineType } from '@pulumi/aws/rds'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'

import { MONITORING_LOGS_ID } from '@zk-dashboard/synchronizer/common/constants'

const config = new pulumi.Config()

const vpc = new awsx.ec2.Vpc('aurora-vpc', {
  subnetStrategy: 'Auto',
  enableDnsHostnames: true,
  numberOfAvailabilityZones: 2,
  subnetSpecs: [
    {
      name: 'public',
      type: 'Public',
      cidrMask: 24,
    },
    {
      name: 'private',
      type: 'Private',
      cidrMask: 24,
    },
  ],
  tags: { project: 'zk-dashboard' },
})

const dbSecurityGroup = new aws.ec2.SecurityGroup('DbSecurityGroup', {
  vpcId: vpc.vpcId,
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 5432,
      toPort: 5432,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],
  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],
  tags: { project: 'zk-dashboard' },
})

const dbMasterPassword = new random.RandomPassword('dbPassword', {
  length: 16,
  special: false,
})

const dbMasterUsername = new random.RandomString('dbUsername', {
  length: 8,
  lower: true,
  numeric: false,
  special: false,
})

const awsRdsSubnetGroup = new aws.rds.SubnetGroup('aws-rds-subnet-group', {
  subnetIds: vpc.publicSubnetIds,
})

const dbCluster = new aws.rds.Cluster('AuroraServerlessCluster', {
  engine: 'aurora-postgresql',
  storageType: 'aurora-iopt1',
  databaseName: 'zkdashboard',
  storageEncrypted: true,
  masterUsername: dbMasterUsername.result,
  masterPassword: dbMasterPassword.result,
  skipFinalSnapshot: true,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  dbSubnetGroupName: awsRdsSubnetGroup.name,
  serverlessv2ScalingConfiguration: {
    minCapacity: 1,
    maxCapacity: 2,
  },
  tags: { project: 'zk-dashboard' },
})

const dbInstance = new aws.rds.ClusterInstance(
  'AuroraServerlessClusterInstance',
  {
    engine: dbCluster.engine as pulumi.OutputInstance<EngineType>,
    engineVersion: dbCluster.engineVersion,
    instanceClass: 'db.serverless',
    clusterIdentifier: dbCluster.id,
    publiclyAccessible: true,
    tags: { project: 'zk-dashboard' },
  }
)

export const dbClusterEndpoint = dbCluster.endpoint
export const dbInstanceEndpoint = dbInstance.endpoint
export const dbClusterUsername = dbCluster.masterUsername
export const dbClusterPassword = dbCluster.masterPassword

// Container for syncer
const cluster = new aws.ecs.Cluster('cluster', {})

// Create the ECR repository to store our container image
const repo = new awsx.ecr.Repository('repo', {
  forceDelete: true,
})

// Build and publish our application's container image from ./app to the ECR repository.
const image = new awsx.ecr.Image('image', {
  platform: 'linux/amd64',
  repositoryUrl: repo.url,
  dockerfile: '../synchronizer/Dockerfile',
  context: '../',
})

const logGroup = new aws.cloudwatch.LogGroup('logGroup', {
  retentionInDays: 7, // 7 days
})

// Define the service and configure it to use our image
const service = new awsx.ecs.FargateService('service', {
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
  },
  cluster: cluster.arn,
  taskDefinitionArgs: {
    container: {
      environment: [
        {
          name: 'ETHERSCAN_API_KEY',
          value: config.requireSecret('etherscan_api_key'),
        },
        {
          name: 'BLOCK_PI_SCROLL_API_KEY',
          value: config.requireSecret('block_pi_scroll_api_key'),
        },
        {
          name: 'BLOCK_PI_POLYGON_ZK_EVM_API_KEY',
          value: config.requireSecret('block_pi_polygon_zk_evm_api_key'),
        },
        {
          name: 'BLOCK_PI_ZK_SYNC_ERA_API_KEY',
          value: config.requireSecret('block_pi_zk_sync_era_api_key'),
        },
        {
          name: 'BLOCK_PI_LINEA_API_KEY',
          value: config.requireSecret('block_pi_linea_api_key'),
        },
        {
          name: 'BLOCK_PI_ETHEREUM_API_KEY',
          value: config.requireSecret('block_pi_ethereum_api_key'),
        },
        {
          name: 'MOBULA_API_KEY',
          value: config.requireSecret('mobula_api_key'),
        },
        {
          name: 'SENTRY_DSN',
          value: config.requireSecret('sentry_dsn'),
        },
        {
          name: 'POSTGRES_URL',
          value: pulumi.interpolate`postgresql://${dbClusterUsername}:${dbClusterPassword}@${dbClusterEndpoint}/${dbCluster.databaseName}`,
        },
      ],
      name: 'awsx-ecs',
      image: image.imageUri,
      cpu: 128,
      memory: 512,
      essential: true,
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': logGroup.name,
          'awslogs-region': aws.config.region,
          'awslogs-stream-prefix': 'ecs',
        },
      },
    },
  },
})

// Create an SNS topic
const snsTopic = new aws.sns.Topic('snsTopic')
const logMetricTransformationNamespace = 'MayaDashboardMetrics'

// Create an SNS email subscription to send notifications to slack channel
const emailSubscription = new aws.sns.TopicSubscription('emailSubscription', {
  topic: snsTopic.arn,
  protocol: 'email',
  endpoint: config.require('slack_alerts_email'),
})

const synchronizerMetricFilter = new aws.cloudwatch.LogMetricFilter(
  'syncMetricFilter',
  {
    logGroupName: logGroup.name,
    pattern: MONITORING_LOGS_ID.SYNC_END,
    metricTransformation: {
      name: 'SyncStart',
      namespace: logMetricTransformationNamespace,
      value: '1',
    },
  }
)

// Create a CloudWatch Alarm to alert when the metric is not increased at least once in a day
const syncMetricAlarm = new aws.cloudwatch.MetricAlarm('syncMetricAlarm', {
  name: 'SyncEndAlarm',
  comparisonOperator: 'LessThanThreshold',
  threshold: 1, // at least once in a `period`
  period: 60 * 60 * 24, // 1 day
  evaluationPeriods: 1, // 1 day
  metricName: synchronizerMetricFilter.metricTransformation.name,
  namespace: synchronizerMetricFilter.metricTransformation.namespace,
  statistic: 'Sum',
  alarmDescription:
    'Alarm when SyncEnd metric is not increased at least once in a day',
  actionsEnabled: true,
  alarmActions: [snsTopic.arn], // Add SNS topic ARN or other actions here
})

const materializedViewMetricFilter = new aws.cloudwatch.LogMetricFilter(
  'materializedViewMetricFilter',
  {
    logGroupName: logGroup.name,
    pattern: MONITORING_LOGS_ID.MATERIALIZED_VIEW_REFRESH_END,
    metricTransformation: {
      name: 'MaterializedViewRefreshStart',
      namespace: logMetricTransformationNamespace,
      value: '1',
    },
  }
)

// Create a CloudWatch Alarm to alert when the metric is not increased at least once in a day
const materializedViewMetricAlarm = new aws.cloudwatch.MetricAlarm(
  'materializedViewMetricAlarm',
  {
    name: 'MaterializedViewRefreshStartAlarm',
    comparisonOperator: 'LessThanThreshold',
    threshold: 1, // at least once in a `period`
    period: 60 * 60 * 24, // 1 day
    evaluationPeriods: 1, // 1 day
    metricName: materializedViewMetricFilter.metricTransformation.name,
    namespace: materializedViewMetricFilter.metricTransformation.namespace,
    statistic: 'Sum',
    alarmDescription:
      'Alarm when MaterializedViewRefreshEnd metric is not increased at least once in a day',
    actionsEnabled: true,
    alarmActions: [snsTopic.arn], // Add SNS topic ARN or other actions here
  }
)
