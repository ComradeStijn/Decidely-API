import {
  ExtractJwt,
  Strategy,
  StrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import { findUserById, validateUser } from "./services/userServices";
import { prismaClient } from "./app";
import { User } from "@prisma/client";
import dotenv from "dotenv";
import passport from "passport";
dotenv.config();

export type Payload = {
  sub: string;
  role: string;
  name: string;
  amount: number;
};

// export type User = {
//   id: string,
//   name: string,
//   email: string | null,
//   token: string,
//   role: string,
//   createdAt: Date,
//   updatedAt: Date,
//   proxyAmount: number,
//   userGroupId: string | null
// }

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "testsecret",
};

passport.use(
  new Strategy(opts, async (jwtPayload: Payload, done: VerifiedCallback) => {
    try {
      const userId = jwtPayload.sub;
      
      const user: User | null = await findUserById(prismaClient, userId);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
