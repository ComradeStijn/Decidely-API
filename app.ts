import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import { configurePassport } from "./passport.config";
import passport from "passport";
import { login } from "./controllers/authController";

const app: Express = express();
export const prismaClient = new PrismaClient();

configurePassport(passport);

app.use(express.json());

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Test get request" });
});

app.post("/test", (req: Request, res: Response) => {
  login(req, res);
});

app.use("/protected", passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
  res.json({ message: "Protected Success"})
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
