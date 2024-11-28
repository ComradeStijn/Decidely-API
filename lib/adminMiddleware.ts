import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import { User } from "@prisma/client";
config();

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User | undefined;
  
  if (!user || user.role !== "admin") {
    res
      .status(403)
      .json({
        success: false,
        message: "You do not have administrator privileges",
      });
    return;
  }

  next();
}
