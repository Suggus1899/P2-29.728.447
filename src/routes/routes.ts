import { Router, Request, Response, NextFunction } from "express";
import { capitalize } from "../utils/helpers";
import { validateContactMiddleware, validatePaymentMiddleware } from "../middlewares/validation";
import { ContactsController } from "../controllers/ContactsController";
import { PaymentController } from "../controllers/PaymentsController";
import { PaymentModel } from "../models/PaymentsModel";

const router = Router();

// Rutas generales optimizadas
const pages: { path: string; title: string }[] = ["index", "about", "services", "traductions"].map((page) => ({
  path: `/${page === "index" ? "" : page}`,
  title: `${capitalize(page)} - LoveDoc`,
}));

pages.forEach(({ path, title }) => {
  router.get(path, async (req: Request, res: Response) => {
    res.render(path.replace("/", ""), { title });
  });
});

// Rutas de contacto con validación mejorada
router.get("/contact", ContactsController.contactPage);
router.post("/contact/add", validateContactMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ContactsController.add(req, res, next); 
  } catch (err) {
    console.error("Error en el formulario de contacto:", err);
    next(new Error("Error al procesar el formulario de contacto"));
  }
});
router.get("/admin/contacts", ContactsController.index);

// Rutas de pago con manejo de errores mejorado
router.get("/payment", async (req: Request, res: Response) => {
  res.render("payment", {
    title: "Pago",
    message: "",
    success: false,
    errors: [],
    data: { cardName: "", email: "", cardNumber: "", expMonth: "", expYear: "", amount: "" },
  });
});

router.post("/payment/process", validatePaymentMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await PaymentController.process(req, res, next);
  } catch (err) {
    console.error("Error en el proceso de pago:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Error interno desconocido";
    next(new Error(errorMessage));
  }
});

// Ruta de administración de pagos con corrección en `message`
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

// Middleware de manejo de errores mejorado
router.use((req: Request, res: Response) => {
  res.status(404).render("error", {
    errorCode: 404,
    errorMessage: `Página no encontrada: ${req.originalUrl}`,
  });
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error en la aplicación:", err);
  res.status(err.status || 500).render("error", {
    errorCode: err.status || 500,
    errorMessage: err.message || "Error interno del servidor",
  });
});

export default router;