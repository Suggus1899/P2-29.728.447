import { Request, Response, NextFunction } from "express";
import { PaymentModel, Payment } from "../models/PaymentsModel";
import crypto from "crypto";

export class PaymentController {
  private static model = new PaymentModel();

  // 🔹 Encriptación del número de tarjeta (SHA-256)
  private static encryptCardNumber(cardNumber: string): string {
    return crypto.createHash("sha256").update(cardNumber.replace(/\s+/g, "")).digest("hex");
  }

  // 🔹 Validaciones de pago
  private static validatePayment(data: Record<string, string>): string[] {
    const { service, email, cardName, cardNumber, expMonth, expYear, cvv, amount, currency } = data;
    const errors: string[] = [];

    if (!service) errors.push("Debes seleccionar un servicio.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Correo inválido.");
    if (!cardName) errors.push("El nombre de la tarjeta es obligatorio.");
    if (!cardNumber || !/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, ""))) errors.push("Número de tarjeta inválido.");
    if (!expMonth || Number(expMonth) < 1 || Number(expMonth) > 12) errors.push("Mes de expiración inválido.");
    if (!cvv || !/^\d{3,4}$/.test(cvv)) errors.push("CVV inválido.");

    const yearNum = Number(expYear);
    const monthNum = Number(expMonth);
    const now = new Date();

    // Validación de tarjeta expirada
    if (!expYear || yearNum < now.getFullYear() || (yearNum === now.getFullYear() && monthNum < now.getMonth() + 1)) {
      errors.push("La tarjeta está expirada.");
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) errors.push("Monto debe ser mayor que cero.");
    if (!["USD", "EUR", "MXN"].includes(currency)) errors.push("Moneda no permitida.");

    return errors;
  }

  // Procesa el pago (ahora `static`)
  static async process(req: Request, res: Response, next: NextFunction) {
    console.log("📌 Datos recibidos en el formulario de pago:", req.body);

    const errors = PaymentController.validatePayment(req.body);
    if (errors.length > 0) {
      return res.status(400).render("payment", {
        message: "Corrige los errores del formulario.",
        success: false,
        errors,
        data: req.body,
      });
    }

    try {
      const { service, email, cardName, cardNumber, expMonth, expYear, cvv, amount, currency } = req.body;

      const pago: Payment = {
        service,
        email,
        cardName,
        cardNumber: PaymentController.encryptCardNumber(cardNumber), 
        expMonth,
        expYear,
        cvv,
        amount: parseFloat(amount),
        currency,
        created_at: new Date().toISOString(),
      };

      await PaymentModel.addPayment(pago);

      return res.render("payment", {
        success: true,
        message: "¡Pago realizado con éxito!",
        errors: [],
        data: {},
      });
    } catch (err) {
      console.error("Error al registrar pago:", err);
      return res.status(500).render("payment", {
        message: "Error interno del servidor.",
        success: false,
        errors: [],
        data: req.body,
      });
    }
  }

  // Obtiene la lista de pagos (ahora `static`)
  static async index(req: Request, res: Response) {
    try {
      const payments = await PaymentModel.getAllPayments() || [];
      console.log("📌 Pagos recuperados:", payments);
      return res.render("admin/payments", {
        payments,
        message: payments.length > 0 ? "" : "No hay pagos registrados aún.",
      });
    } catch (error) {
      console.error("Error al obtener pagos:", error);
      return res.status(500).render("admin/payments", {
        payments: [],
        message: "Error al cargar los pagos.",
      });
    }
  }
}