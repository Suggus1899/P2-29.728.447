import { Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";

const router = Router();

router.get("/login", (req: Request, res: Response) => AuthController.showLoginForm(req, res));
router.post("/login", (req: Request, res: Response) => AuthController.login(req, res));
router.get("/register", (req: Request, res: Response) => AuthController.showRegisterForm(req, res));
router.post("/register", (req: Request, res: Response) => AuthController.register(req, res));
router.get("/logout", (req: Request, res: Response) => AuthController.logout(req, res));

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback";

const oAuth2Client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
});

// Ruta para iniciar Google OAuth2
router.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "select_account",
  });
  res.redirect(url);
});

// Ruta de callback de Google OAuth2
router.get("/auth/google/callback", (req: Request, res: Response) => {
  (async () => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send("No se recibió el código de Google.");
    }
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // Obtener datos del usuario
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile: any = await response.json();
    // Aquí puedes buscar o crear el usuario en tu base de datos
    // Por simplicidad, lo guardamos en sesión
    const user = {
      id: profile.id,
      username: profile.email,
      role: "user",
      google: true,
    };

    req.session.user = user;

    res.redirect("/");
  })().catch((err) => {
    console.error("Error en Google OAuth2:", err);
    res.status(500).send("Error al autenticar con Google.");
  });
});

export default router;