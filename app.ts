import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import { configurePassport } from "./passport.config";
import passport from "passport";
import authRouter from "./routes/authRouter";
import formRouter from "./routes/formRouter";

export const app: Express = express();
export const prismaClient = new PrismaClient();

configurePassport(passport);

app.use(express.json());

app.use("/login", authRouter);
app.use("/forms", passport.authenticate("jwt", { session: false }), formRouter);

app.use(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req: Request, res: Response) => {
    res.json({ message: "Protected Success" });
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
