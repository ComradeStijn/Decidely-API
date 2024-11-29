import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { deleteForm } from "../services/formServices";
import { User } from "@prisma/client";
import { prismaClient } from "../app";
import { deleteUser } from "../services/userServices";

const deleteFormSchema = z.object({
  formId: z.string().trim(),
});

async function deleteFormController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as User | undefined;
    const parsedData = deleteFormSchema.parse(req.body);
    const { formId } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const deleted = await prismaClient.$transaction(async (tx) => {
      const response = await deleteForm(tx, formId);
      return response;
    });

    res.json({ success: true, message: deleted });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    next(e);
  }
}

const deleteUserSchema = z.object({
  userId: z.string().trim(),
});

async function deleteUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as User | undefined;
    const parsedData = deleteUserSchema.parse(req.body);
    const { userId } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const deleted = await prismaClient.$transaction(async (tx) => {
      const response = await deleteUser(tx, userId);
      return response;
    });

    res.json({ success: true, message: deleted });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
    }
    next(e);
  }
}

export default {
  deleteFormController,
  deleteUserController,
};
