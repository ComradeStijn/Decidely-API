import { Request, Response, NextFunction } from "express";
import request from "supertest";
import { app } from "../../app";
import { deleteForm } from "../../services/formServices";

vi.mock("../../services/formServices", async () => {
  const original = await vi.importActual("../../services/formServices");

  return {
    ...original,
    deleteForm: vi.fn(),
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

describe("Delete form", () => {
  it("No body", async () => {
    const response = await request(app).delete("/admin/forms");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Incorrect formId", async () => {
    const response = await request(app).delete("/admin/forms").send({
      formId: 2,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("No formId", async () => {
    const response = await request(app).delete("/admin/forms").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Correct body", async () => {
    vi.mocked(deleteForm).mockResolvedValue({ test: true } as any);
    const response = await request(app).delete("/admin/forms").send({
      formId: "2",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual({ test: true });
  });
});
