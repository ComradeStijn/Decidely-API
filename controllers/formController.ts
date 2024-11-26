import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../app";
import { findAllFormsByUser } from "../services/formServices";
import { User } from "@prisma/client";

async function retrieveForms(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const forms = await prismaClient.$transaction(async (tx) => {
      const result = await findAllFormsByUser(tx, user.id);
      return result;
    });

    const returnObject = forms.map((form) => ({
      id: form.form.id,
      title: form.form.title,
      decisions: form.form.decisions.map((decision) => ({
        id: decision.id,
        title: decision.title,
      })),
    }));

    res.json(returnObject);
  } catch (e) {
    next(e);
  }
}

export default {
  retrieveForms,
};
