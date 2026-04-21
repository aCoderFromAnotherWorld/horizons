import { createRequire } from "node:module";
import { runMigrations } from "./migrations.js";
import { SCHEMA } from "./schema.js";

let db;
const require = createRequire(import.meta.url);

function getDatabaseConstructor() {
  if (!process.versions.bun) {
    const { DatabaseSync } = require("node:sqlite");
    return class NodeSqliteDatabase {
      constructor(path) {
        this.db = new DatabaseSync(path);
      }

      exec(sql) {
        return this.db.exec(sql);
      }

      query(sql) {
        const statement = this.db.prepare(sql);
        return {
          get: (...params) => statement.get(...params),
          all: (...params) => statement.all(...params),
          run: (...params) => statement.run(...params),
        };
      }

      transaction(fn) {
        return (...args) => {
          this.db.exec("BEGIN");
          try {
            const result = fn(...args);
            this.db.exec("COMMIT");
            return result;
          } catch (error) {
            this.db.exec("ROLLBACK");
            throw error;
          }
        };
      }

      close() {
        return this.db.close();
      }
    };
  }

  const moduleName = "bun" + ":sqlite";
  return require(moduleName).Database;
}

/**
 * Returns the singleton SQLite database connection.
 */
export function getDb() {
  if (!db) {
    const Database = getDatabaseConstructor();
    db = new Database(process.env.DB_PATH || "./horizons.db", { create: true });
    db.exec(SCHEMA);
    runMigrations(db);
  }
  return db;
}

/**
 * Replaces the singleton DB connection for isolated unit tests.
 */
export function setDbForTests(testDb) {
  db = testDb;
}

/**
 * Clears the singleton DB connection for isolated unit tests.
 */
export function resetDbForTests() {
  db = undefined;
}
