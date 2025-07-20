import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail", // Usa el proveedor adecuado
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendEmail(data: { nombre: string; email: string; comment: string; ip: string; pais: string; date: string }) {
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
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado correctamente.");
    } catch (error) {
        console.error("Error al enviar correo:", error);
    }
}