import { Router, Request, Response, NextFunction } from "express";
import { capitalize } from "../utils/helpers";
import { validateContactMiddleware, validatePaymentMiddleware } from "../middlewares/validation";
import { ContactsController } from "../controllers/ContactsController";
import { PaymentController } from "../controllers/PaymentsController";
import { PaymentModel } from "../models/PaymentsModel";

const router = Router();

// Rutas generales
const pages: { path: string; title: string }[] = ["index", "about", "services", "traductions"].map((page) => ({
  path: `/${page === "index" ? "" : page}`,
  title: `${capitalize(page)} - LoveDoc`,
}));

pages.forEach(({ path, title }) => {
  router.get(path, (req: Request, res: Response) => {
    res.render(path.replace("/", ""), { title });
  });
});

// Contacto
router.get("/contact", ContactsController.contactPage);
router.post("/contact/add", validateContactMiddleware, ContactsController.add);
router.get("/admin/contacts", ContactsController.index);

// Pagos
router.get("/payment", (req: Request, res: Response) => {
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

router.post("/payment/process", validatePaymentMiddleware, PaymentController.process);

// Administración de pagos
router.get("/admin/payments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await PaymentModel.getAllPayments();
    res.render("admin/payments", {
      payments,
      message: payments.length > 0 ? "" : "No hay pagos registrados aún.",
    });
  } catch (err) {
    console.error("Error al obtener pagos:", err);
    res.status(500).render("admin/payments", {
      payments: [],
      message: "Error al cargar la lista de pagos.",
    });
  }
});

// Errores 404
router.use((req: Request, res: Response) => {
  res.status(404).render("error", {
    errorCode: 404,
    errorMessage: `Página no encontrada: ${req.originalUrl}`,
  });
});

// Errores generales
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error en la aplicación:", err);
  res.status(err.status || 500).render("error", {
    errorCode: err.status || 500,
    errorMessage: err.message || "Error interno del servidor",
  });
});

export default router;