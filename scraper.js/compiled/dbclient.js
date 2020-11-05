"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTables = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dbclient = new client_dynamodb_1.DynamoDBClient({});
async function listTables() {
    try {
        const results = await dbclient.send(new client_dynamodb_1.ListTablesCommand({}));
        results.TableNames.forEach(function (item) {
            console.log(item);
        });
    }
    catch (err) {
        console.error(err);
    }
}
exports.listTables = listTables;
exports.default = dbclient;
//# sourceMappingURL=dbclient.js.map