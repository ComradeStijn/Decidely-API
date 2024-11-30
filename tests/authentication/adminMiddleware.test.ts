import { NextFunction, Request, Response } from "express";
import request from "supertest";
import passport from "../../passport.config";
import { Mock } from "vitest";
import { app } from "../../app";
import { authenticate } from "passport";

const mocks = vi.hoisted(() => {
  return {
    role: vi.fn(),
  };
});

vi.mock("../../lib/authenticateWrapper", () => ({
  authenticateUser: vi.fn().mockImplementation(() => {
    return (req: Request, res: Response, next: NextFunction) => {
      (req.user = { id: 1, role: mocks.role() }), next();
    };
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isAdmin", () => {
  it("Not admin", async () => {
    mocks.role.mockReturnValue("user");
    const response = await request(app).get("/admin/check");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message.toLowerCase()).toContain(
      "you do not have administrator"
    );
  });

  it("Is admin", async () => {
    mocks.role.mockReturnValue("admin");
    const response = await request(app).get("/admin/check");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.toLowerCase()).toContain(
      "admin check success"
    );
  });
});
