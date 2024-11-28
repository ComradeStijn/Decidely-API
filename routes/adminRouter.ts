import { Request, Response, Router } from "express";

const router = Router();

router.get("/check", (req: Request, res: Response) => {
  console.log("should see")
  res.status(200).json({ success: true, message: "Admin Check Success" });
  return;
});

export default router;
