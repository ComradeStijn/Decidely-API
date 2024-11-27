import request from "supertest";
import { app } from "../../app";
import { validateUser as originalValidateUser } from "../../services/userServices";

vi.mock('../../services/userServices', () => ({
  validateUser: vi.fn()
}))

const validateUser = vi.mocked(originalValidateUser);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("userLogin", async () => {
  it("GET not allowed", async () => {
    const response = await request(app).get("/login");

    expect(response.status).toBe(405);
    expect(response.body).toMatchObject({ success: false });
  });

  it("No body provided", async () => {
    const response = await request(app).post("/login");

    expect(response.status).toBe(401);
    expect(response.body.message.toLowerCase()).toContain("no user or token");
  });

  it("Incorrect login", async () => {
    validateUser.mockResolvedValue(false);

    const response = await request(app)
      .post("/login")
      .send({ username: "test", token: "bad token" });

    expect(response.status).toBe(401);
    expect(response.body.message.toLowerCase()).toContain("incorrect login");
  });


  it("Correct login", async () => {
    validateUser.mockResolvedValue({
      id: "1",
      name: "test",
      role: "user",
      email: null,
      token: "token",
      createdAt: new Date(),
      updatedAt: new Date(),
      proxyAmount: 1,
      userGroupId: null,
    })

    const response = await request(app)
      .post("/login")
      .send({username: "test", token: "good token"})

    expect(validateUser).toHaveBeenCalledOnce()
    expect(response.status).toBe(200)
    expect(response.body.message).toHaveProperty("token")
  })
});
