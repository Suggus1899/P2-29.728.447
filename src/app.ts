import express from "express";
import path from "path";
import routes from "./routes/routes";
import helmet from "helmet"; // Protección adicional

const app = express();

// Configuración de motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware de seguridad (helmet)
app.use(helmet());

// Archivos estáticos con manejo seguro
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
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

export default app;