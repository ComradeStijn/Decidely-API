import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../app";
import { User } from "@prisma/client";
import { findAllForms } from "../services/formServices";

async function viewAllForms(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const forms = await prismaClient.$transaction(async (tx) => {
      const result = await findAllForms(tx);
      return result;
    });

    res.json({ success: true, message: forms });
    return;
  } catch (e) {
    next(e);
  }
}

export default {
  viewAllForms,
};
