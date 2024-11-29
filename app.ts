import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import passport from "./passport.config";
import authRouter from "./routes/authRouter";
import formRouter from "./routes/formRouter";
import protectRouter from "./routes/protectRouter";
import adminRouter from "./routes/adminRouter";
import { isAdmin } from "./lib/adminMiddleware";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";

export const app: Express = express();
export const prismaClient = new PrismaClient();

app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 600 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." },
  })
);
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? "" : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/login", authRouter);
app.use("/forms", passport.authenticate("jwt", { session: false }), formRouter);
app.use("/protect", protectRouter);
app.use(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  adminRouter
);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
