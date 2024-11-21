import { Request, Response, Router } from "express";
import authController from "../controllers/authController";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json("Test");
});

router.post("/", authController.login);

export default router;
