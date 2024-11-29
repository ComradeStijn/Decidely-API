import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { deleteForm } from "../services/formServices";
import { User } from "@prisma/client";
import { prismaClient } from "../app";

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

export default {
  deleteFormController,
};
