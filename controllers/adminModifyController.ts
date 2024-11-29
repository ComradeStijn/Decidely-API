import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prismaClient } from "../app";
import { changeProxyOfUser } from "../services/userServices";

const modifyProxySchema = z.object({
  userId: z.string().trim(),
  newAmount: z.number().int().min(1),
});

async function modifyProxy(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    const parsedData = modifyProxySchema.parse(req.body);
    const { userId, newAmount } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
    }

    const modify = await prismaClient.$transaction(async (tx) => {
      const response = await changeProxyOfUser(tx, userId, newAmount);
      return response;
    });

    res.json({ success: true, message: modify });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
    }
  }
}

export default {
  modifyProxy,
};
