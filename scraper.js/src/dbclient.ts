import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'

const dbclient = new DynamoDBClient({})

export async function listTables() {
  try {
    const results = await dbclient.send(new ListTablesCommand({}));
    results.TableNames.forEach(function (item) {
      console.log(item);
    });
  } catch (err) {
    console.error(err)
  }
}

export default dbclient