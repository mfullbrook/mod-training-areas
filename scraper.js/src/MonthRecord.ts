import { ListTablesCommand, GetItemCommand, GetItemInput, GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import dbclient from './dbclient'

export default class MonthRecord {

  static tableName: string

  private __exists: Boolean = false

  constructor(
    readonly locationId: string,
    readonly month: string,
    readonly area: string,
    readonly lastUpdated?: Date,
  ) {}

  
  save() {
    console.debug('TODO save')
  }

  static init(tableName: string) {
    MonthRecord.tableName = tableName
  }

  static async find(name: string, area: string): Promise<MonthRecord> {
    const id = `${area}/${name}`
    const { Item } = await dbclient.send(new GetItemCommand({
      TableName: MonthRecord.tableName,
      Key: {
        locationId: { S: id }
      }
    }))

    if (!Item) {
      return new MonthRecord(id, name, area, null)
    }

    const record = new MonthRecord(id, name, area, new Date(Item.lastUpdated.S))
    record.__exists = true

    return record
  }
}

