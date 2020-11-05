"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dbclient_1 = __importDefault(require("./dbclient"));
class LocationRecord {
    constructor(id, name, area, lastUpdated) {
        this.id = id;
        this.name = name;
        this.area = area;
        this.lastUpdated = lastUpdated;
        this.__exists = false;
    }
    isNew() {
        return !this.__exists;
    }
    isNotNew() {
        return !this.__exists;
    }
    isUpToDate(updated) {
        if (this.__exists === false) {
            return false;
        }
        // we're assuming that a saved record is accurate
        if (!updated || updated <= this.lastUpdated) {
            return true;
        }
        return false;
    }
    save() {
        console.debug('TODO save');
    }
    static init(tableName) {
        LocationRecord.tableName = tableName;
    }
    static async find(name, area) {
        const id = `${area}/${name}`;
        const { Item } = await dbclient_1.default.send(new client_dynamodb_1.GetItemCommand({
            TableName: LocationRecord.tableName,
            Key: {
                locationId: { S: id }
            }
        }));
        if (!Item) {
            return new LocationRecord(id, name, area, null);
        }
        const record = new LocationRecord(id, name, area, new Date(Item.lastUpdated.S));
        record.__exists = true;
        return record;
    }
}
exports.default = LocationRecord;
//# sourceMappingURL=LocationRecord.js.map