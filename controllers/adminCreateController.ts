import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../app";

async function createForm(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const result = await prismaClient.$transaction(async (tx) => {
      
    })

  } catch (e) {
    next(e);
  }
}

export default {
  createForm,
};
