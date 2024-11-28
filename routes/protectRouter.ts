import { NextFunction, Request, Response, Router } from "express";
import passport from '../passport.config'

const router = Router();

router.get("/", passport.authenticate("jwt", { session: false }), (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Protect success" });
    return;
  }
);


router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    res.status(401).json({ success: false, message: "Protect fail" });
    return;
  } else {
    next();
  }
});
export default router;
