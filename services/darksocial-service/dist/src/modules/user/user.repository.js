"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const postgresql_provider_1 = require("../../databases/postgresql/postgresql.provider");
const base_repository_1 = require("../../databases/repository/base.repository");
const user_schema_1 = require("./schemas/user.schema");
const driver_1 = require("drizzle-orm/postgres-js/driver");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
let UserRepository = class UserRepository extends base_repository_1.BaseRepository {
    constructor(postgres) {
        super(postgres, user_schema_1.usersTable);
    }
    async getUserByFullnameLike(searchNameString, limit) {
        const users = await this.postgres
            .select()
            .from(this.table)
            .where((0, drizzle_orm_2.or)((0, drizzle_orm_1.like)(user_schema_1.usersTable.firstName, `%${searchNameString}%`), (0, drizzle_orm_1.like)(user_schema_1.usersTable.lastName, `%${searchNameString}%`)))
            .limit(limit);
        return users;
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(postgresql_provider_1.POSTGRES)),
    __metadata("design:paramtypes", [driver_1.PostgresJsDatabase])
], UserRepository);
//# sourceMappingURL=user.repository.js.map