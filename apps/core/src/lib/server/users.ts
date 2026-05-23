import { users } from "@healthcheck/db/schema";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";

export async function createUser(name: string, email: string) {
  const result = await db.insert(users).values({ name, email }).returning();
  return result[0];
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function getUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function updateUser(
  id: number,
  data: { name?: string; email?: string },
) {
  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}
