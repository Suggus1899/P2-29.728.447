import { Router } from "express";
import {ContactsController} from "../controllers/ContactsController";

const router = Router();

router.get("/", (req, res) => {
    res.render("contact", { title: "Contactos" });
});

router.post("/contact/add", ContactsController.add);

export default router;