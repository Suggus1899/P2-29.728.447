import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getDB } from "../models/UserModel";

export const AuthController = {
  showLoginForm(req: Request, res: Response) {
    res.render("auth/login", { title: "Iniciar sesión", message: null });
  },

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const db = await getDB();

    const user = await db.get("SELECT * FROM users WHERE username = ?", username);
    if (!user) {
      return res.render("auth/login", {
        title: "Iniciar sesión",
        message: "Usuario no encontrado",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render("auth/login", {
        title: "Iniciar sesión",
        message: "Contraseña incorrecta",
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role || "user",
    };

    return res.redirect("/");
  },

  showRegisterForm(req: Request, res: Response) {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).render("error", {
        errorCode: "403",
        errorMessage: "Acceso denegado",
      });
    }

    res.render("auth/register", { title: "Registro de usuarios", message: null });
  },

  async register(req: Request, res: Response) {
    const { username, password } = req.body;
    const db = await getDB();

    const existing = await db.get("SELECT * FROM users WHERE username = ?", username);
    if (existing) {
      return res.render("auth/register", {
        title: "Registro",
        message: "Ese usuario ya existe",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      username,
      password_hash,
      "user"
    );

    res.redirect("/admin/users");
  },

  logout(req: Request, res: Response) {
    req.session.destroy(() => res.redirect("/login"));
  },
};