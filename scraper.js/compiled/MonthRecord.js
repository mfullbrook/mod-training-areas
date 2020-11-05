"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dbclient_1 = __importDefault(require("./dbclient"));
class MonthRecord {
    constructor(locationId, month, area, lastUpdated) {
        this.locationId = locationId;
        this.month = month;
        this.area = area;
        this.lastUpdated = lastUpdated;
        this.__exists = false;
    }
    save() {
        console.debug('TODO save');
    }
    static init(tableName) {
        MonthRecord.tableName = tableName;
    }
    static async find(name, area) {
        const id = `${area}/${name}`;
        const { Item } = await dbclient_1.default.send(new client_dynamodb_1.GetItemCommand({
            TableName: MonthRecord.tableName,
            Key: {
                locationId: { S: id }
            }
        }));
        if (!Item) {
            return new MonthRecord(id, name, area, null);
        }
        const record = new MonthRecord(id, name, area, new Date(Item.lastUpdated.S));
        record.__exists = true;
        return record;
    }
}
exports.default = MonthRecord;
//# sourceMappingURL=MonthRecord.js.map