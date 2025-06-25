import express from "express";
import path from "path";
import routes from "./routes/routes";
import helmet from "helmet";
import crypto from "crypto"; // Generar nonce para CSP más seguro

const app = express();

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware de seguridad (helmet) con ajuste de CSP
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString("base64");
    res.locals.nonce = nonce; // Enviar el nonce a las vistas

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
                    "https://www.google.com"
                ],
                "script-src-elem": ["'self'", `'nonce-${nonce}'`, "https://unpkg.com", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                "connect-src": ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/", "https://www.google.com", "https://www.google.com/recaptcha/api/siteverify"],
                "frame-src": ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/", "https://www.google.com"],
                "img-src": ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"]
            }
        }
    })(req, res, next);
});

// Archivos estáticos con manejo seguro
app.use(express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css");
        }
        if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    }
}));

// Uso de rutas con prefijo
app.use("/", routes);

// Manejo de errores global
app.use((req, res) => {
    res.status(404).render("error", {
        errorCode: 404,
        errorMessage: "Página no encontrada",
    });
});

// Exportar configuración del servidor
export default app;