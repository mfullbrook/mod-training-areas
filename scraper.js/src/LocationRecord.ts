import { ListTablesCommand, GetItemCommand, GetItemInput, GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import dbclient from './dbclient'

export default class LocationRecord {

  static tableName: string

  private __exists: Boolean = false

  constructor(
    readonly id: string,
    readonly name: string,
    readonly area: string,
    readonly lastUpdated?: Date,
  ) {}

  isNew() {
    return !this.__exists
  }

  isNotNew() {
    return !this.__exists
  }

  isUpToDate(updated?: Date): Boolean {
    if (this.__exists === false) {
      return false
    }
    // we're assuming that a saved record is accurate
    if (!updated || updated <= this.lastUpdated) {
      return true
    }
    return false
  }

  save() {
    console.debug('TODO save')
  }

  static init(tableName: string) {
    LocationRecord.tableName = tableName
  }

  static async find(name: string, area: string): Promise<LocationRecord> {
    const id = `${area}/${name}`
    const { Item } = await dbclient.send(new GetItemCommand({
      TableName: LocationRecord.tableName,
      Key: {
        locationId: { S: id }
      }
    }))

    if (!Item) {
      return new LocationRecord(id, name, area, null)
    }

    const record = new LocationRecord(id, name, area, new Date(Item.lastUpdated.S))
    record.__exists = true

    return record
  }
}

