import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prismaClient } from "../app";
import { changeUserGroup } from "../services/userServices";
import {
  assignFormToGroup,
  removeFormFromGroup,
} from "../services/formAssignService";
import { checkRelationUser } from "../services/relationCheckServices";

const assignUserToGroupSchema = z.object({
  userId: z.string().trim(),
  groupId: z.string().trim(),
});

// Note: This controller is disabled. Functionality only allows user to be permanently assigned to group
// async function putUserToGroup(req: Request, res: Response, next: NextFunction) {
//   try {
//     const user = req.user as User | undefined;
//     const parsedData = assignUserToGroupSchema.parse(req.body);
//     const { userId, groupId } = parsedData;

//     if (!user) {
//       res.status(401).json({ success: false, message: "No user found" });
//       return;
//     }

//     const newUser = await prismaClient.$transaction(async (tx) => {
//       const response = await changeUserGroup(tx, userId, groupId);
//       return response;
//     });

//     res.status(200).json({ success: true, message: newUser });
//   } catch (e) {
//     if (e instanceof z.ZodError) {
//       res.status(400).json({ success: false, message: e.message });
//       return;
//     }
//     next(e);
//   }
// }

const assignFormToGroupSchema = z.object({
  groupId: z.string().trim(),
  formId: z.string().trim(),
});

async function putGroupToForm(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    const parsedData = assignFormToGroupSchema.parse(req.body);
    const { groupId, formId } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const groupForm = await prismaClient.$transaction(async (tx) => {
      const result = await assignFormToGroup(tx, formId, groupId);
      return result;
    });

    res.json({ success: true, message: groupForm });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    next(e);
  }
}

const deleteGroupToFormSchema = z.object({
  formId: z.string().trim(),
  groupId: z.string().trim(),
});

async function deleteGroupToForm(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as User | undefined;
    const parsedData = deleteGroupToFormSchema.parse(req.body);
    const { formId, groupId } = parsedData;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
    }

    const deleted = await prismaClient.$transaction(async (tx) => {
      const result = await removeFormFromGroup(tx, formId, groupId);
      return result;
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
  putGroupToForm,
  deleteGroupToForm,
};
