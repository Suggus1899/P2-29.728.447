"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const PaymentsController_1 = require("../controllers/PaymentsController");
const router = (0, express_1.Router)();
router.get("/admin/payments", isAuthenticated_1.isAuthenticated, PaymentsController_1.PaymentController.listPayments);
router.post("/payment/process", PaymentsController_1.PaymentController.processPayment);
exports.default = router;
