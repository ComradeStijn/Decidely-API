import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response, NextFunction } from "express";
import authRouter from "./routes/authRouter";
import formRouter from "./routes/formRouter";
import protectRouter from "./routes/protectRouter";
import adminRouter from "./routes/adminRouter";
import { isAdmin } from "./lib/adminMiddleware";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import { authenticateUser } from "./lib/authenticateWrapper";

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
    origin: process.env.NODE_ENV === "prod" ? "" : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(morgan(process.env.NODE_ENV === "prod" ? "combined" : "dev"));

app.use("/login", authRouter);
app.use("/forms", authenticateUser(), formRouter);
app.use("/protect", protectRouter);
app.use("/admin", authenticateUser(), isAdmin, adminRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
