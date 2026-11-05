"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return "Wrong username or password";
  }
  await createSession({ id: user.id, username: user.username });
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function changePassword(_prev: string | null, form: FormData): Promise<string | null> {
  const me = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 6) return "New password must be at least 6 characters";
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, me.id));
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return "Current password is wrong";
  await db.update(schema.users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(schema.users.id, me.id));
  return "✓ Password changed";
}
