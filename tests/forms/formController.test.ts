import request from "supertest";
import { app } from "../../app";
import * as formService from "../../services/formServices";
import { NextFunction, Request, Response } from "express";
import { Mock } from "vitest";
import passport from "../../passport.config";

vi.mock("../../services/formServices", () => ({
  findAllFormsByUser: vi.fn(),
}));

let user: Boolean = false
vi.mock("../../passport.config", () => ({
  default: {
    authenticate: vi.fn().mockImplementation(
      (strategy, options) =>
        (req: Request, res: Response, next: NextFunction) => {
          req.user = user ? {id: 1} : undefined;
          next();
        }
    ),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Retrieve Form", () => {
  it("No user", async () => {
    const response = await request(app).get("/forms");

    expect(response.status).toBe(401);
  });

  it("Retrieve none", async () => {
    user = true;
    (formService.findAllFormsByUser as Mock).mockResolvedValue([]);

    const response = await request(app).get("/forms");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("Retrieve two forms", async () => {
    user = true;
    (formService.findAllFormsByUser as Mock).mockResolvedValue([
      {
        form: {
          id: "1",
          title: "Form 1",
          createdAt: new Date(),
          updatedAt: new Date(),
          decisions: [
            {
              id: "1",
              title: "Decision 1",
              votes: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              formId: "1",
            },
          ],
        },
      },
      {
        form: {
          id: "2",
          title: "Form 2",
          createdAt: new Date(),
          updatedAt: new Date(),
          decisions: [
            {
              id: "2",
              title: "Decision 2",
              votes: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              formId: "2",
            },
          ],
        },
      },
    ]);

    const response = await request(app).get("/forms");
    const expectedReturn = [
      {
        id: "1",
        title: "Form 1",
        decisions: [
          {
            id: "1",
            title: "Decision 1",
          },
        ],
      },
      {
        id: "2",
        title: "Form 2",
        decisions: [
          {
            id: "2",
            title: "Decision 2",
          },
        ],
      },
    ];
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedReturn);
  });
});
