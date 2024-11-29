import request from "supertest";
import { app } from "../../app";
import { Request, Response, NextFunction } from "express";
import { changeUserGroup } from "../../services/userServices";
import { assignFormToGroup } from "../../services/formAssignService";

vi.mock("../../services/userServices", async () => {
  const original = await vi.importActual("../../services/userServices");

  return {
    ...original,
    changeUserGroup: vi.fn(),
  };
});

vi.mock("../../services/formAssignService", async () => {
  const original = await vi.importActual("../../services/formAssignService");

  return {
    ...original,
    assignFormToGroup: vi.fn(),
  };
});

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

describe("Assign User to Group", () => {
  it("No body", async () => {
    const response = await request(app).post("/admin/users/assign");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect userId", async () => {
    const response = await request(app).post("/admin/users/assign").send({
      userId: 2,
      groupId: "2",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No userId", async () => {
    const response = await request(app).post("/admin/users/assign").send({
      groupId: "2",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect groupId", async () => {
    const response = await request(app).post("/admin/users/assign").send({
      userId: "2",
      groupId: 2,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No groupId", async () => {
    const response = await request(app).post("/admin/users/assign").send({
      userId: "2",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Correct body", async () => {
    vi.mocked(changeUserGroup).mockResolvedValue({ test: true } as any);
    const response = await request(app).post("/admin/users/assign").send({
      userId: "2",
      groupId: "2",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toStrictEqual({ test: true });
  });
});

describe("Assign Form to Group", () => {
  it("No body", async () => {
    const response = await request(app).post("/admin/groups/assign");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect groupId", async () => {
    const response = await request(app).post("/admin/groups/assign").send({
      groupId: 2,
      formId: "d",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No groupId", async () => {
    const response = await request(app).post("/admin/groups/assign").send({
      formId: "d",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect formId", async () => {
    const response = await request(app).post("/admin/groups/assign").send({
      groupId: "d",
      formId: 2,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No formId", async () => {
    const response = await request(app).post("/admin/groups/assign").send({
      groupId: "d",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Correct body", async () => {
    vi.mocked(assignFormToGroup).mockResolvedValue({ test: true } as any);
    const response = await request(app).post("/admin/groups/assign").send({
      groupId: "d",
      formId: "d",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual({ test: true });
  });
});
