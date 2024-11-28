import request from "supertest";
import { app } from "../../app";
import { vi } from "vitest";
import { NextFunction, Request, Response } from "express";

// This testfile I made to see how to bypass authentication logic in routetesting

beforeEach(() => {
  vi.resetAllMocks();
});

vi.mock("../../passport.config", () => ({
  default: {
    authenticate: vi
      .fn()
      .mockImplementation(
        (strategy, options) =>
          (req: Request, res: Response, next: NextFunction) => {
            req.user = {
              id: "1",
              username: "Stijn",
            };
            next();
          }
      ),
  },
}));

describe("Test", () => {
  it("test", async () => {
    const response = await request(app).get("/protect");
    console.log(response)
    expect(response.status).toBe(200);
  });
});
