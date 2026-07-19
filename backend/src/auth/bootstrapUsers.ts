import bcrypt from "bcrypt";
import { db } from "../db/surreal.js";
import type { User } from "../models/User.js";

async function bootstrapUser(email: string, password: string): Promise<void> {
  const [existing] = await db.query<[User[]]>("SELECT id FROM user WHERE email = $email", { email });
  if (existing.length > 0) return;

  const password_hash = await bcrypt.hash(password, 12);
  await db.query("CREATE user CONTENT { email: $email, password_hash: $password_hash }", { email, password_hash });
  console.log(`Bootstrapped account for ${email}`);
}

// EXTRA_USERS lets you add accounts by editing .env instead of building a user-management
// UI — format: "email1:password1,email2:password2". Existing accounts are left untouched
// (no password sync), and malformed entries are skipped with a warning rather than
// crashing startup, since this is a convenience, not critical infra like JWT_SECRET.
export async function bootstrapUsers(): Promise<void> {
  await bootstrapUser(process.env.ADMIN_EMAIL as string, process.env.ADMIN_PASSWORD as string);

  const extraUsers = process.env.EXTRA_USERS?.trim();
  if (!extraUsers) return;

  for (const entry of extraUsers.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const sep = trimmed.indexOf(":");
    if (sep === -1) {
      console.warn(`Skipping malformed EXTRA_USERS entry "${trimmed}" (expected email:password)`);
      continue;
    }

    const email = trimmed.slice(0, sep).trim();
    const password = trimmed.slice(sep + 1).trim();
    if (!email || password.length < 8) {
      console.warn(`Skipping EXTRA_USERS entry for "${email}": password must be at least 8 characters`);
      continue;
    }

    await bootstrapUser(email, password);
  }
}
