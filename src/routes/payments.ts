import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { PaymentController } from "../controllers/PaymentsController";

const router = Router();

// Mostrar formulario de pago
router.get("/", (req, res) => {
  res.render("payment", {
    title: "Pago",
    message: "",
    success: false,
    errors: [],
    data: {
      cardName: "",
      email: "",
      cardNumber: "",
      expMonth: "",
      expYear: "",
      amount: ""
    }
  });
});

router.get("/admin/payments", isAuthenticated, PaymentController.listPayments);
router.post("/payment/process", PaymentController.processPayment);

export default router;