import { Request, Response, NextFunction } from 'express';
import { PaymentModel, Payment } from '../models/PaymentsModel'; 
import crypto from 'crypto';

export class PaymentController {
    // ✅ Procesa el pago
    static async process(req: Request, res: Response, next: NextFunction) {
        console.log("📌 Datos recibidos en el formulario de pago:", req.body);  // ✅ Depuración

        const { service, email, cardName, cardNumber, expMonth, expYear, amount, currency } = req.body;
        const errors: string[] = [];

        // 🔍 Validaciones básicas
        if (!service) errors.push('Debes seleccionar un servicio.');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Correo inválido.');
        if (!cardName) errors.push('El nombre de la tarjeta es obligatorio.');
        if (!cardNumber || !/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, ''))) errors.push('Número de tarjeta inválido.');
        if (!expMonth || !expYear) errors.push('Fecha de expiración inválida.');
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errors.push('Monto inválido.');
        if (!['USD', 'EUR', 'MXN'].includes(currency)) errors.push('Moneda no permitida.');

        if (errors.length > 0) {
            return res.status(400).render("payment", {
                message: "Corrige los errores del formulario.",
                success: false,
                errors,
                data: req.body
            });
        }

        // 🔒 Encriptación del número de tarjeta
        const encryptCardNumber = (cardNumber: string): string => {
            return crypto.createHash('sha256').update(cardNumber.replace(/\s+/g, '')).digest('hex');
        };

        try {
            const pago: Payment = {
                service,
                email,
                cardName,
                cardNumber: encryptCardNumber(cardNumber),
                expMonth,
                expYear,
                amount,
                currency,
                created_at: new Date().toISOString()
            };

            await PaymentModel.addPayment(pago);

            res.render("payment", {
                success: true,
                message: "¡Pago realizado con éxito!",
                errors: [],
                data: {}
            });
        } catch (err) {
            console.error("❌ Error al registrar pago:", err);
            res.status(500).render("payment", {
                message: "❌ Error interno del servidor.",
                success: false,
                errors: [],
                data: req.body
            });
        }
    }

    // ✅ Obtiene la lista de pagos
    static async index(req: Request, res: Response) {
        try {
            const payments = await PaymentModel.getAllPayments() || []; // ✅ Evita valores indefinidos
            
            console.log("📌 Pagos recuperados:", payments); // ✅ Depuración para ver los datos
            
            res.render("admin/payments", { 
                payments, 
                message: payments.length > 0 ? "" : "No hay pagos registrados aún." // ✅ Aseguramos que `message` siempre tenga un valor
            });
        } catch (error) {
            console.error("❌ Error al obtener pagos:", error);

            res.status(500).render("admin/payments", { 
                payments: [], 
                message: "❌ Error al cargar los pagos." 
            });
        }
    }
}