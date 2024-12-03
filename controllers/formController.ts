import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../app";
import { findAllFormsByUser } from "../services/formServices";
import { Decision, User } from "@prisma/client";
import { voteUserOnForm } from "../services/votingServices";

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

    res.json({ success: true, message: returnObject });
  } catch (e) {
    next(e);
  }
}

async function retrieveProxy(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const amount = await prismaClient.$transaction(async (tx) => {
      const result = await tx.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          proxyAmount: true,
        },
      });
      return result;
    });
    if (!amount) {
      res
        .json(400)
        .json({ success: false, message: "No proxyamount found in database" });
      return;
    }

    res.json({ success: true, message: amount });
  } catch (e) {
    next(e);
  }
}

type receivedDecision = {
  decision: string;
  amount: number;
};

async function voteOnForm(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    const { formId } = req.params;
    const decisions: receivedDecision[] = req.body.decisions;

    if (!user) {
      res.status(401).json({ success: false, message: "No user found" });
      return;
    }

    const result = await prismaClient.$transaction(async (tx) => {
      const vote = await voteUserOnForm(tx, user.id, formId, decisions);
      return vote;
    });

    if (!result) {
      res
        .status(400)
        .json({ success: false, message: "form or decision data incorrect" });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, message: `Form ${formId} vote success` });
      return;
    }
  } catch (e) {
    next(e);
  }
}

export default {
  retrieveForms,
  voteOnForm,
  retrieveProxy
};
