import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_cloudfront } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DiscordBotCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const imagesBucket = new Bucket(this, 'S3Bucket')
    new aws_cloudfront(this, 'GifsCloudFront', {
      originConfigs: [
        {
          behaviors: [
            {

            }
          ],
          s3OriginSource: {
            s3BucketSource: imagesBucket } 
          }
        ]
    }
    )
  }
}