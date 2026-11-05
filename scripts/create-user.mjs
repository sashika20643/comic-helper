// Usage: node scripts/create-user.mjs <username> <password>
// Creates the user, or resets the password if the user already exists.
import postgres from "postgres";
import bcrypt from "bcryptjs";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error("Usage: node scripts/create-user.mjs <username> <password>");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const hash = await bcrypt.hash(password, 10);
await sql`
  insert into users (username, password_hash) values (${username.toLowerCase()}, ${hash})
  on conflict (username) do update set password_hash = excluded.password_hash
`;
console.log(`✓ user "${username.toLowerCase()}" saved`);
await sql.end();
