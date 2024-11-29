import request from "supertest";
import { app } from "../../app";
import { vi, Mock } from "vitest";
import { NextFunction, Request, Response } from "express";

// This testfile I made to see how to bypass authentication logic in routetesting


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

beforeEach(() => {
  vi.clearAllMocks()
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Test", () => {
  it("test", async () => {
    const response = await request(app).get("/protect");

    expect(response.status).toBe(200);
  });
});
