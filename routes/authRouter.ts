import { Request, Response, Router } from "express";
import authController from "../controllers/authController";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, message: "GET is not a valid method" });
});

router.post("/", authController.login);

export default router;
