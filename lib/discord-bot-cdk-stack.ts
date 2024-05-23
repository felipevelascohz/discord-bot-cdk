import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { aws_ecs } from 'aws-cdk-lib';
import { maxHeaderSize } from 'http';
import { EcsApplication } from 'aws-cdk-lib/aws-codedeploy';
import { aws_ec2 } from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import { aws_ecs_patterns } from 'aws-cdk-lib';
import { ApplicationScalingAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { aws_scheduler } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DiscordBotCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const imagesBucket = new Bucket(this, 'S3Bucket')
    
    new cloudfront.Distribution(this, 'DiscordCF', {
      defaultBehavior: {
        origin: new S3Origin(imagesBucket)  
      }})

    const vpc = new aws_ec2.Vpc ( this, 'vpc', {maxAzs: 1});
    const cluster = new aws_ecs.Cluster ( this, 'EcsCluster', {vpc});
    
    const taskDefinition = new aws_ecs.Ec2TaskDefinition ( this, 'TaskDef');
    taskDefinition.addContainer('TheContainer', {
      image: aws_ecs.ContainerImage.fromRegistry('example-image'),
      memoryLimitMiB: 256,
      
    })
    taskDefinition.addContainer("WebContainer", {
      image: aws_ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
    });

    Tags.of(taskDefinition).add('my-tag', 'my-tag-value')

    const scheduleFargateTask =new aws_ecs_patterns.ScheduledFargateTask (this, 'ScheduledFargateTask', {
      cluster,
      taskDefinition: taskDefinition,
      schedule: cdk.aws_applicationautoscaling.Schedule.expression('rate ( 1 minute)'),
      propagateTags: aws_ecs.PropagatedTagSource.TASK_DEFINITION,
    });
  }
}