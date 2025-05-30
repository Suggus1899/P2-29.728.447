"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Usa el proveedor adecuado
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
function sendEmail(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ["programacion2ais@yopmail.com", "gustavojose0819@gmail.com"], // Se pueden agregar más destinatarios
            subject: "Nueva solicitud de contacto",
            text: `
        Nombre: ${data.nombre}
        Email: ${data.email}
        Comentario: ${data.comment}
        Dirección IP: ${data.ip}
        País: ${data.pais}
        Fecha/Hora: ${data.date}
        `
        };
        try {
            yield transporter.sendMail(mailOptions);
            console.log("Correo enviado correctamente.");
        }
        catch (error) {
            console.error("Error al enviar correo:", error);
        }
    });
}
