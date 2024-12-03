import { Payload } from "../passport.config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validateUser } from "../services/userServices";
import { prismaClient } from "../app";
dotenv.config();

async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userName, token } = req.body;

    if (!userName || !token) {
      res
        .status(401)
        .json({ success: false, message: "No user or token provided" });
      return;
    }

    const validate = await prismaClient.$transaction(async (tx) => {
      return await validateUser(tx, userName, token);
    });

    if (!validate) {
      res
        .status(401)
        .json({ success: false, message: "Incorrect Login Information" });
      return;
    }

    const payload: Payload = {
      sub: validate.id,
      name: validate.name,
      role: validate.role,
      amount: validate.proxyAmount
    };

    const jsontoken = jwt.sign(payload, process.env.JWT_SECRET || "test", {
      expiresIn: "1h",
    });

    res.json({ success: true, message: { token: jsontoken } });
    return;
  } catch (err) {
    next(err);
  }
}

export default {
  login,
};
