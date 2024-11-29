import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prismaClient } from "../app";
import { changeUserGroup } from "../services/userServices";

const assignUserToGroupSchema = z.object({
  userId: z.string().trim(),
  groupId: z.string().trim(),
});

async function putUserToGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    const parsedData = assignUserToGroupSchema.parse(req.body);
    const { userId, groupId } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
    }

    const newUser = await prismaClient.$transaction(async (tx) => {
      const response = await changeUserGroup(tx, userId, groupId);
      return response;
    });

    res.status(200).json({ success: true, message: newUser });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    next(e);
  }
}

export default {
  putUserToGroup,
};
