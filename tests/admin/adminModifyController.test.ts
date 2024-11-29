import { Request, Response, NextFunction } from "express";
import request from "supertest";
import { changeProxyOfUser } from "../../services/userServices";
import { app } from "../../app";

vi.mock("../../services/userServices", async () => {
  const original = await vi.importActual("../../services/userServices");

  return {
    ...original,
    changeProxyOfUser: vi.fn(),
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

describe("modifyProxy", () => {
  it("No body", async () => {
    const response = await request(app).put("/admin/users/proxy");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect userId", async () => {
    const response = await request(app).put("/admin/users/proxy").send({
      userId: 2,
      newAmount: 2,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No userId", async () => {
    const response = await request(app).put("/admin/users/proxy").send({
      newAmount: 2,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect newAmount", async () => {
    const response = await request(app).put("/admin/users/proxy").send({
      userId: "2",
      newAmount: "2",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No newAmount", async () => {
    const response = await request(app).put("/admin/users/proxy").send({
      userId: "2",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Correct body", async () => {
    vi.mocked(changeProxyOfUser).mockResolvedValue({ test: true } as any);
    const response = await request(app).put("/admin/users/proxy").send({
      userId: "2",
      newAmount: 2,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual({ test: true });
  });
});
