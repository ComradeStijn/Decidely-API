import { Payload } from "../passport.config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validateUser } from "../services/userServices";
import { prismaClient } from "../app";
dotenv.config();

export async function login(req: Request, res: Response) {
  const { user, token } = req.body;

  if (!user || !token) {
    return res.status(401).json({message: "No user or token provided"})
  
  }

  const validate = await prismaClient.$transaction(async (tx) => {
    return await validateUser(tx, user, token);
  });

  if (!validate) {
    return res.status(401).json({ message: "Incorrect Login Information" });
  }

  const payload: Payload = {
    sub: user,
    token: token,
  };

  const jsontoken = jwt.sign(payload, process.env.JWT_SECRET || "test", {
    expiresIn: "1h",
  });

  return res.json({ token: jsontoken });
}
