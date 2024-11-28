import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../app";
import { z } from "zod";
import { createForm } from "../services/formServices";
import { createNewUser } from "../services/userServices";

const createFormSchema = z.object({
  title: z.string().trim(),
  decisions: z.array(z.string().trim()),
});

async function postForm(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    const parsedData = createFormSchema.parse(req.body);
    const { title, decisions } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    await prismaClient.$transaction(async (tx) => {
      const response = await createForm(tx, title, decisions);
      return response;
    });

    res.json({ success: true, message: "Form created" });
    return;
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    next(e);
  }
}

const createUserSchema = z.object({
  username: z.string(),
  amount: z.number().int().min(1),
  userGroupId: z.string(),
  email: z.string().email().optional(),
  role: z.string(),
});

async function postUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    const parsedData = createUserSchema.parse(req.body);
    const { username, amount, userGroupId, email, role } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    await prismaClient.$transaction(async (tx) => {
      const response = await createNewUser(
        tx,
        username,
        amount,
        userGroupId,
        email,
        role
      );
      return response;
    });

    res.json({ success: true, message: "User created" });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    next(e);
  }
}

export default {
  postForm,
  postUser
};
