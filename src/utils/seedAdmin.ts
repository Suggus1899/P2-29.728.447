import bcrypt from "bcrypt";
import { getDB } from "../models/UserModel";

export async function seedAdmin() {
  const db = await getDB();
  const exists = await db.get(`SELECT * FROM users WHERE username = ?`, ["admin"]);
  if (!exists) {
    const password_hash = await bcrypt.hash("admin123", 10);
    await db.run(
      `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
      ["admin", password_hash, "admin"]
    );
    console.log("✅ Admin creado: admin / admin123");
  }
}