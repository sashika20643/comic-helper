// Applies pending SQL migrations from ./drizzle. Runs on every container start.
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
console.log("✓ database migrated");
await sql.end();
