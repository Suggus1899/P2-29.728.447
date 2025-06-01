import express from "express";
import path from "path";
import routes from "./routes/routes";
import helmet from "helmet"; // Protección adicional

const app = express();

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware de seguridad (helmet) con ajuste de CSP para permitir Google reCAPTCHA
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'", "https://unpkg.com"],
                "script-src": [
                    "'self'",
                    "https://unpkg.com",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://www.google.com"
                ],
                "script-src-elem": [
                    "'self'",
                    "https://unpkg.com",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://www.google.com"
                ],
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"],
                "frame-src": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://www.google.com"
                ],
                "connect-src": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://www.google.com"
                ]
            }
        }
    })
);

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

// Uso de rutas con prefijo para mayor control
app.use("/", routes);

// Manejo global de errores
app.use((req, res) => {
    res.status(404).render("error", {
        errorCode: 404,
        errorMessage: "Página no encontrada",
    });
});

// Exportar la configuración del servidor
export default app;