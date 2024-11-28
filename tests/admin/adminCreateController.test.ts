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

describe("Create User", () => {
  it("No title in body", async () => {
    const response = await request(app)
      .post("/admin/forms")
      .send({
        decisions: ["test"],
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Title is not string", async () => {
    const response = await request(app)
      .post("/admin/forms")
      .send({
        title: 1,
        decisions: ["test"],
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No decision in body", async () => {
    const response = await request(app).post("/admin/forms").send({
      title: "title",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Decision is not structured properly", async () => {
    const response = await request(app).post("/admin/forms").send({
      title: "title",
      decisions: "false",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Correct body", async () => {
    const response = await request(app)
      .post("/admin/forms")
      .send({
        title: "title",
        decisions: ["false"],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.toLowerCase()).toContain("form created");
  });
});
