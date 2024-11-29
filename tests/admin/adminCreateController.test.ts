import request from "supertest";
import { app } from "../../app";
import { Request, Response, NextFunction } from "express";
import { createNewUser } from "../../services/userServices";
import { Mock } from "vitest";

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

vi.mock("../../services/userServices", async () => {
  const original = vi.importActual("../../services/userServices");

  return {
    ...original,
    createNewUser: vi.fn()
  };
});

vi.mock("../../services/relationCheckServices", async () => {
  return {
    checkRelationUser: vi.fn()
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("Create Form", () => {
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
        title: `Title ${Date.now()}`,
        decisions: ["flse", "tr22e"],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.toLowerCase()).toContain("form created");
  });
});

describe("Create user", () => {
  it("No information in body", async () => {
    const response = await request(app).post("/admin/users");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect username", async () => {
    const response = await request(app).post("/admin/users").send({
      username: 2,
      amount: 1,
      userGroupId: "2",
      email: "baba@baba.com",
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No username", async () => {
    const response = await request(app).post("/admin/users").send({
      amount: 1,
      userGroupId: "2",
      email: "baba@baba.com",
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect amount", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      amount: "1",
      userGroupId: "2",
      email: "baba@baba.com",
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No amount", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      userGroupId: "2",
      email: "baba@baba.com",
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect userGroupId", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      amount: 1,
      userGroupId: 123,
      email: "baba@baba.com",
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No userGroupId", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      amount: 1,
      email: "baba@baba.com",
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect mail", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      amount: 1,
      userGroupId: "2",
      email: 3,
      role: "User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect role", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      amount: 1,
      userGroupId: "2",
      email: "baba@baba.com",
      role: 2,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No role", async () => {
    const response = await request(app).post("/admin/users").send({
      username: "Stijn",
      amount: 1,
      userGroupId: "2",
      email: "baba@baba.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Correct structure", async () => {
    vi.mocked(createNewUser).mockResolvedValue(true as any)
    const response = await request(app).post("/admin/users").send({
      username: "test",
      amount: 1,
      userGroupId: "2",
      email: "baba@baba.com",
      role: "user",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.toLowerCase()).toContain("user created");
  });
});
