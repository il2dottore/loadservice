"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
class BaseRepository {
    postgres;
    table;
    constructor(postgres, table) {
        this.postgres = postgres;
        this.table = table;
    }
    buildWhereClause(where) {
        if (!where)
            return undefined;
        const conditions = Object.entries(where)
            .filter(([, val]) => val !== undefined)
            .map(([key, val]) => {
            const column = this.table[key];
            return (0, drizzle_orm_1.eq)(column, val);
        });
        return conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
    }
    async findOne(where) {
        const clause = this.buildWhereClause(where);
        const source = this.table;
        const query = this.postgres.select().from(source);
        if (clause) {
            query.where(clause);
        }
        const result = await query.limit(1);
        return result[0] ?? null;
    }
    async find(where) {
        const clause = this.buildWhereClause(where);
        const source = this.table;
        const query = this.postgres.select().from(source);
        if (clause) {
            query.where(clause);
        }
        const result = await query;
        return result;
    }
    async insertOne(data) {
        const result = await this.postgres
            .insert(this.table)
            .values(data)
            .returning();
        return result[0];
    }
    async insert(data) {
        const result = await this.postgres
            .insert(this.table)
            .values(data)
            .returning();
        return result;
    }
    async updateOne(where, data) {
        const clause = this.buildWhereClause(where);
        const query = this.postgres.update(this.table).set(data);
        if (clause) {
            query.where(clause);
        }
        const result = await query.returning();
        return result[0] ?? null;
    }
    async update(where, data) {
        const clause = this.buildWhereClause(where);
        const query = this.postgres.update(this.table).set(data);
        if (clause) {
            query.where(clause);
        }
        const result = await query.returning();
        return result;
    }
    async deleteOne(where) {
        const clause = this.buildWhereClause(where);
        const query = this.postgres.delete(this.table);
        if (clause) {
            query.where(clause);
        }
        const result = await query.returning();
        return result[0] ?? null;
    }
    async delete(where) {
        const clause = this.buildWhereClause(where);
        const query = this.postgres.delete(this.table);
        if (clause) {
            query.where(clause);
        }
        const result = await query.returning();
        return result;
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map