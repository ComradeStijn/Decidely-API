import { Router } from "express";
import formController from "../controllers/formController";

const router = Router();

router.get("/", formController.retrieveForms);

router.get("/proxy", formController.retrieveProxy);

router.put("/:formId", formController.voteOnForm);

export default router;
