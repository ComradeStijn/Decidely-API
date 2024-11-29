import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../app";
import { User } from "@prisma/client";
import { findAllForms } from "../services/formServices";
import { findAllUserGroups, findAllUsers } from "../services/userServices";

async function getAllForms(req: Request, res: Response, next: NextFunction) {
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

async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
    }

    const users = await prismaClient.$transaction(async (tx) => {
      const result = await findAllUsers(tx);
      return result;
    });

    res.json({ success: true, message: users });
    return;
  } catch (e) {
    next(e);
  }
}

async function getAllGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
    }

    const users = await prismaClient.$transaction(async (tx) => {
      const result = await findAllUserGroups(tx);
      return result;
    });

    res.json({ success: true, message: users });
    return;
  } catch (e) {
    next(e);
  }
}

export default {
  getAllForms,
  getAllUsers,
  getAllGroups
};
