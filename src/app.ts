import express from "express";
import path from "path";
import routes from "./routes/routes";
import helmet from "helmet"; // Protección adicional

const app = express();

// Configuración de motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware de seguridad (helmet) con ajuste de CSP
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'", "https://unpkg.com"],
                "script-src": ["'self'", "https://unpkg.com"],
                "script-src-elem": ["'self'", "https://unpkg.com"], // Permitir `ionicons`
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"]
            }
        }
    })
);

// Archivos estáticos con manejo seguro
app.use(express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css"); // MIME corregido
        }
    }
}));

// Uso de rutas con prefijo para mayor control
app.use("/", routes);

// manejo global de errores
app.use((req, res) => {
    res.status(404).render("error", {
        errorCode: 404,
        errorMessage: "Página no encontrada",
    });
});

// Exportar la configuración del servidor
export default app;