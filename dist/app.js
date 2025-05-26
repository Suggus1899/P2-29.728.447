"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes/routes"));
const helmet_1 = __importDefault(require("helmet")); // Protección adicional
const app = (0, express_1.default)();
// Configuración de motor de plantillas
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "../views"));
// Middleware de seguridad (helmet) con ajuste de CSP
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'", "https://unpkg.com"],
            "script-src": ["'self'", "https://unpkg.com"],
            "script-src-elem": ["'self'", "https://unpkg.com"], // Permitir `ionicons`
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"]
        }
    }
}));
// Archivos estáticos con manejo seguro
app.use(express_1.default.static(path_1.default.join(__dirname, "../public"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css"); // MIME corregido
        }
    }
}));
// Uso de rutas con prefijo para mayor control
app.use("/", routes_1.default);
// manejo global de errores
app.use((req, res) => {
    res.status(404).render("error", {
        errorCode: 404,
        errorMessage: "Página no encontrada",
    });
});
// Exportar la configuración del servidor
exports.default = app;
