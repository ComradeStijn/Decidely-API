import { Router } from "express";
import formController from "../controllers/formController";

const router = Router();

router.get("/", formController.retrieveForms);

export default router;
