# MOD Training Area Opening Times

Mountain bikers and walkers can enjoy restricted MOD training areas at specific times.  This app shows the opening times in a convenient form.

This is fun side-project to practice using some different tech:
* Python to scrape the data from the gov.uk website, persist to the data store and trigger site rebuild.
* AWS DynamoDB to store the data
* AWS Lambda to Run the python code
* AWS EventBridge (or AWS CloudWatch) to schedule calling the Lambda function
* AWS CDK to build the AWS infrastructure
* Next.js, React and Typescript for a server-side rendered website consuming data from DynamoDB
* Vercel to build and deploy the site

Bonus points, trial different build and deployment strategies:
* Vercel - the simplest
* [Serverless Framework with CDK](https://dev.to/aws-builders/using-serverless-framework-and-cdk-together-12he)
* [AWS Amplify and CDK](https://aws.amazon.com/blogs/mobile/deploying-a-static-website-with-aws-amplify-and-cdk/)
* Directly to AWS Lambda with CDK
