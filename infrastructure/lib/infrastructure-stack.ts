import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import { Rule as EventsRule, Schedule } from '@aws-cdk/aws-events'
import { LambdaFunction as LambdaFunctionTarget } from '@aws-cdk/aws-events-targets'

export class InfrastructureStack extends cdk.Stack {

  private locationsTable: dynamodb.Table
  private monthsTable: dynamodb.Table
  private scraperLambda: lambda.Function

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.createTables()
    this.createScraperLambda()
    this.createScraperScheduler()
    this.frontendUser()
  }
  
  createTables() {
    this.locationsTable = new dynamodb.Table(this, 'LocationsTable', {
      // tableName: 'locations',
      partitionKey: {
        name: 'locationId', type: dynamodb.AttributeType.STRING,
      }
    })

    this.monthsTable = new dynamodb.Table(this, 'MonthsTable', {
      // tableName: 'months',
      partitionKey: { name: 'locationId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'month', type: dynamodb.AttributeType.STRING },
    })
  }

  createScraperLambda() {
    this.scraperLambda = new lambda.Function(this, 'ScraperHandler', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset('../scraper'),
      handler: 'main.lambda_handler'
    })

    this.locationsTable.grantReadWriteData(this.scraperLambda);
    this.monthsTable.grantReadWriteData(this.scraperLambda);
  }

  createScraperScheduler() {
    new EventsRule(this, 'ScraperScheduler', {
      schedule: Schedule.cron({ hour: '8', minute: '0'}),
      targets: [
        new LambdaFunctionTarget(this.scraperLambda)
      ],
    })
  }

  frontendUser() {
    // create a user for the frontend to fetch data

    // output the credentials

    // create a policy to access the dynamo db tables

    // assign the policy to the user

  }
}
