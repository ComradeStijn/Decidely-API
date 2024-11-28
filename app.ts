import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import passport from "./passport.config";
import authRouter from "./routes/authRouter";
import formRouter from "./routes/formRouter";
import protectRouter from "./routes/protectRouter";
import adminRouter from "./routes/adminRouter";
import { isAdmin } from "./lib/adminMiddleware";

export const app: Express = express();
export const prismaClient = new PrismaClient();

app.use(express.json());

app.use("/login", authRouter);
app.use("/forms", passport.authenticate("jwt", { session: false }), formRouter);
app.use("/protect", protectRouter);
app.use("/admin", passport.authenticate("jwt", { session: false }), isAdmin, adminRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
