import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { PaymentController } from "../controllers/PaymentsController";

const router = Router();

router.get("/admin/payments", isAuthenticated, PaymentController.listPayments);
router.post("/payment/process", PaymentController.processPayment);

export default router;