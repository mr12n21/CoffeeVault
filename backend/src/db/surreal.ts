import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Surreal } from "surrealdb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SURREAL_URL = process.env.SURREAL_URL ?? "http://localhost:8000";
const SURREAL_USER = process.env.SURREAL_USER ?? "root";
const SURREAL_PASS = process.env.SURREAL_PASS ?? "root";
const SURREAL_NS = process.env.SURREAL_NS ?? "coffeevault";
const SURREAL_DB = process.env.SURREAL_DB ?? "coffeevault";

export const db = new Surreal();

export async function connectDb(): Promise<void> {
  await db.connect(`${SURREAL_URL}/rpc`, {
    namespace: SURREAL_NS,
    database: SURREAL_DB,
    auth: {
      username: SURREAL_USER,
      password: SURREAL_PASS,
    },
  });

  const schema = readFileSync(path.join(__dirname, "schema.surql"), "utf-8");
  await db.query(schema);
}
