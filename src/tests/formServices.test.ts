import {
  createForm,
  findFormByTitle,
  deleteForm,
} from "../services/formServices";
import { client } from "../services/userServices";

beforeEach(async () => {
  await client.decision.deleteMany();
  await client.user.deleteMany();
  await client.userForm.deleteMany();
  await client.userGroup.deleteMany();
  await client.userGroupForm.deleteMany();
  await client.form.deleteMany();
});

describe("Form Creation", async () => {
  it("Create Form with empty decision array", async () => {
    const form = await createForm("Title", []);

    expect(form).toMatchObject({ title: "Title" });
  });

  it("Create Form with decisions", async () => {
    const form = await createForm("Title", ["Dec 1", "Dec 2"]);

    expect(form).toMatchObject({
      title: "Title",
    });
  });
});

describe("Form Finding", async () => {
  it("Finds created form", async () => {
    const form = await createForm("Title", []);

    const result = await findFormByTitle("Title");

    if (form) {
      expect(result).toMatchObject(form);
    } else {
      expect(result).toBeNull();
    }
  });
});

describe("Form Deletion", async () => {
  it("Delete form with decisions", async () => {
    const form = await createForm("Title", ["Decision 1", "Decision 2"]);

    const result = await deleteForm("Title");
    const decisions = await client.decision.findMany();

    if (form) {
      expect(result).toMatchObject(form);
      expect(decisions.length).toBe(0);
    } else {
      expect(result).toBeNull();
    }
  });
});
