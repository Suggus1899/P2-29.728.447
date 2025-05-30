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
exports.PaymentController = void 0;
const PaymentsModel_1 = require("../models/PaymentsModel");
const crypto_1 = __importDefault(require("crypto"));
class PaymentController {
    // Procesa el pago
    static process(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("📌 Datos recibidos en el formulario de pago:", req.body);
            const { service, email, cardName, cardNumber, expMonth, expYear, amount, currency } = req.body;
            const errors = [];
            // 🔍 Validaciones básicas
            if (!service)
                errors.push('Debes seleccionar un servicio.');
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                errors.push('Correo inválido.');
            if (!cardName)
                errors.push('El nombre de la tarjeta es obligatorio.');
            if (!cardNumber || !/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, '')))
                errors.push('Número de tarjeta inválido.');
            if (!expMonth || !expYear)
                errors.push('Fecha de expiración inválida.');
            if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
                errors.push('Monto inválido.');
            if (!['USD', 'EUR', 'MXN'].includes(currency))
                errors.push('Moneda no permitida.');
            if (errors.length > 0) {
                return res.status(400).render("payment", {
                    message: "Corrige los errores del formulario.",
                    success: false,
                    errors,
                    data: req.body
                });
            }
            // 🔒 Encriptación del número de tarjeta
            const encryptCardNumber = (cardNumber) => {
                return crypto_1.default.createHash('sha256').update(cardNumber.replace(/\s+/g, '')).digest('hex');
            };
            try {
                const pago = {
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
                yield PaymentsModel_1.PaymentModel.addPayment(pago);
                res.render("payment", {
                    success: true,
                    message: "¡Pago realizado con éxito!",
                    errors: [],
                    data: {}
                });
            }
            catch (err) {
                console.error("Error al registrar pago:", err);
                res.status(500).render("payment", {
                    message: " Error interno del servidor.",
                    success: false,
                    errors: [],
                    data: req.body
                });
            }
        });
    }
    // Obtiene la lista de pagos
    static index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payments = (yield PaymentsModel_1.PaymentModel.getAllPayments()) || []; // Evita valores indefinidos
                console.log("📌 Pagos recuperados:", payments); // Depuración para ver los datos
                res.render("admin/payments", {
                    payments,
                    message: payments.length > 0 ? "" : "No hay pagos registrados aún."
                });
            }
            catch (error) {
                console.error("Error al obtener pagos:", error);
                res.status(500).render("admin/payments", {
                    payments: [],
                    message: "Error al cargar los pagos."
                });
            }
        });
    }
}
exports.PaymentController = PaymentController;
