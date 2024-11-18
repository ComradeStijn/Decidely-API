import { PrismaClient } from "@prisma/client";
import {
  createForm,
  findFormByTitle,
  deleteForm,
  findAllForms,
} from "../services/formServices";

beforeEach(async () => {
  const client = new PrismaClient();

  await client.$transaction(async (tx) => {
    await tx.decision.deleteMany();
    await tx.user.deleteMany();
    await tx.userForm.deleteMany();
    await tx.userGroup.deleteMany();
    await tx.userGroupForm.deleteMany();
    await tx.form.deleteMany();
  });
});

afterEach(async () => {
  const client = new PrismaClient();

  await client.$transaction(async (tx) => {
    await tx.decision.deleteMany();
    await tx.user.deleteMany();
    await tx.userForm.deleteMany();
    await tx.userGroup.deleteMany();
    await tx.userGroupForm.deleteMany();
    await tx.form.deleteMany();
  });
});



describe("Form Creation", async () => {
  it("Create Form with empty decision array", async () => {
    const client = new PrismaClient();

    client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", []);

      expect(form).toMatchObject({ title: "Title" });
    });
  });

  it("Create Form with decisions", async () => {
    const client = new PrismaClient();

    client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", ["Dec 1", "Dec 2"]);

      expect(form).toMatchObject({
        title: "Title",
      });
    });
  });
});

describe("Form Finding", async () => {
  it("Finds created form", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", []);

      const result = await findFormByTitle(tx, "Title");

      if (form) {
        expect(result).toMatchObject(form);
      } else {
        expect(result).toBeNull();
      }
    });
  });

  it("Find all forms", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const form1 = await createForm(tx, "Title", ["Decision1", "Decision2"]);
      const form2 = await createForm(tx, "Title2", ["Decision3", "Decision4"]);

      const result = await findAllForms(tx);

      expect(result.length).toBe(2);
      expect(result).toMatchObject([form1, form2]);
    });
  });
});

describe("Form Deletion", async () => {
  it("Delete form with decisions", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", ["Decision 1", "Decision 2"]);

      const result = await deleteForm(tx, "Title");
      const decisions = await tx.decision.findMany();

      if (form) {
        expect(result).toMatchObject(form);
        expect(decisions.length).toBe(0);
      } else {
        expect(result).toBeNull();
      }
    });
  });
});
