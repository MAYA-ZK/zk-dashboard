/* eslint-disable no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as aws from '@pulumi/aws'
import type { EngineType } from '@pulumi/aws/rds'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'

const config = new pulumi.Config()

const vpc = new awsx.ec2.Vpc('aurora-vpc', {
  subnetStrategy: 'Auto',
  enableDnsHostnames: true,
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
  tags: { project: 'zk-dashboard' },
})

const dbMasterPassword = new random.RandomPassword('dbPassword', {
  length: 16,
  special: false,
})

const dbMasterUsername = new random.RandomString('dbUsername', {
  length: 8,
  lower: true,
  special: false,
})

const awsRdsSubnetGroup = new aws.rds.SubnetGroup('aws-rds-subnet-group', {
  subnetIds: vpc.publicSubnetIds,
})

const dbCluster = new aws.rds.Cluster('AuroraServerlessCluster', {
  engine: 'aurora-postgresql',
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

// Define the service and configure it to use our image
const service = new awsx.ecs.FargateService('service', {
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
  },
  // assignPublicIp: true,
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
    },
  },
})
