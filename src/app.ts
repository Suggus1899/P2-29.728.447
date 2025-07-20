import express from "express";
import path from "path";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import helmet from "helmet";
import crypto from "crypto";
import dotenv from "dotenv";

// Extender la interfaz de sesión para incluir user
declare module "express-session" {
  interface SessionData {
    user?: { id: number; username: string; role: string };
  }
}

import authRoutes from "./routes/auth";
import contactRoutes from "./routes/contact";
import paymentRoutes from "./routes/payments";

import { createUserTable } from "./models/UserModel";
import { seedAdmin } from "./utils/seedAdmin";

dotenv.config();

const app = express();

// 🧩 Vistas y formularios
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🛡️ Seguridad: CSP con nonce
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;

  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'", "https://unpkg.com"],
        "script-src": [
          "'self'",
          `'nonce-${nonce}'`,
          "https://unpkg.com",
          "https://www.google.com/recaptcha/",
          "https://www.gstatic.com/recaptcha/",
        ],
        "script-src-elem": [
          "'self'",
          `'nonce-${nonce}'`,
          "https://unpkg.com",
          "https://www.google.com/recaptcha/",
          "https://www.gstatic.com/recaptcha/",
        ],
        "connect-src": [
          "'self'",
          "https://www.google.com/recaptcha/",
          "https://www.gstatic.com/recaptcha/",
          "https://www.google.com/recaptcha/api/siteverify",
        ],
        "frame-src": [
          "'self'",
          "https://www.google.com/recaptcha/",
          "https://www.gstatic.com/recaptcha/",
        ],
        "img-src": ["'self'", "https://www.gstatic.com/recaptcha/"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })(req, res, next);
});

// 🔐 Sesiones
app.use(
  session({
    store: new (SQLiteStore(session))() as any,
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 15, // 15 minutos
    },
  })
);

// 📁 Archivos estáticos
app.use(
  express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) res.setHeader("Content-Type", "text/css");
      if (filePath.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
    },
  })
);

// 🧠 Datos para vistas
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// 🗃 Base de datos y admin
createUserTable().then(seedAdmin);

// 🌐 Rutas
app.use(authRoutes);
app.use(contactRoutes);
app.use(paymentRoutes);

// ⚠️ Página no encontrada
app.use((req, res) => {
  res.status(404).render("error", {
    errorCode: 404,
    errorMessage: `Página no encontrada: ${req.originalUrl}`,
  });
});

export default app;