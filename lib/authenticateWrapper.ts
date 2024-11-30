import { NextFunction, Request, Response } from "express";
import passport from "../passport.config";
import { User } from "@prisma/client";

export function authenticateUser() {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: User | false, info: any) => {
        if (err) {
          next(err);
        }

        if (!user) {
          if (info && info.name === "TokenExpiredError") {
            return res
              .status(401)
              .json({ success: false, message: "JWT Token Expired" });
          }
          return res
            .status(401)
            .json({ success: false, message: "Unauthorized access." });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
}
