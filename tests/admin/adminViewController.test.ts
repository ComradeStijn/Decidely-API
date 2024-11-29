import request from "supertest";
import { app } from "../../app";
import { Request, Response, NextFunction } from "express";

vi.mock("../../passport.config", async () => {
  const original = await vi.importActual("../../passport.config");

  return {
    default: {
      ...original,
      authenticate: vi
        .fn()
        .mockImplementation(
          (strategy, options) =>
            (req: Request, res: Response, next: NextFunction) => {
              req.user = { id: 1, role: "admin" };
              next();
            }
        ),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("Admin View", () => {
  it("Forms gets found", async () => {
    const response = await request(app).get("/admin/forms");

    expect(response.status).toBe(200);
  });

  it("Users get found", async () => {
    const response = await request(app).get("/admin/users");

    expect(response.status).toBe(200);
  })

  it("Users get found", async () => {
    const response = await request(app).get("/admin/groups");

    expect(response.status).toBe(200);
  })
});

