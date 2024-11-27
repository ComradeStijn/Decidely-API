import { Router } from "express";
import formController from "../controllers/formController";

const router = Router();

router.get("/", formController.retrieveForms);

router.post

export default router;
