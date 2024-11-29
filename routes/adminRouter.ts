import { Request, Response, Router } from "express";
import adminViewController from "../controllers/adminViewController";
import adminCreateController from "../controllers/adminCreateController";

const router = Router();

router.get("/check", (req: Request, res: Response) => {
  console.log("should see");
  res.status(200).json({ success: true, message: "Admin Check Success" });
  return;
});

router.get("/forms", adminViewController.viewAllForms);

router.post("/forms", adminCreateController.postForm);

// router.get("/users", adminViewController.viewAllUsers);

router.post("/users", adminCreateController.postUser);

export default router;
