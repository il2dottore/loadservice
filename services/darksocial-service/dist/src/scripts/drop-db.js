"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugDatabase_1 = require("./debugDatabase");
async function main() {
    await debugDatabase_1.debugDb.execute(`DROP SCHEMA public CASCADE;`);
    await debugDatabase_1.debugDb.execute(`CREATE SCHEMA public;`);
    await debugDatabase_1.debugClient.end();
}
main();
//# sourceMappingURL=drop-db.js.map