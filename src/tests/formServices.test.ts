import { PrismaClient } from "@prisma/client";
import {
  createForm,
  findFormByTitle,
  deleteForm,
  findAllForms,
} from "../services/formServices";

let client: PrismaClient;
beforeEach(async () => {
  client = new PrismaClient();

  await client.$transaction(async (tx) => {
    await tx.userForm.deleteMany();
    await tx.userGroup.deleteMany();
    await tx.userGroupForm.deleteMany();
    await tx.decision.deleteMany();
    await tx.form.deleteMany();
    await tx.user.deleteMany();
  });
});

// afterEach(async () => {
//   await client.$transaction(async (tx) => {
//     await tx.userForm.deleteMany();
//     await tx.userGroup.deleteMany();
//     await tx.userGroupForm.deleteMany();
//     await tx.decision.deleteMany();
//     await tx.form.deleteMany();
//     await tx.user.deleteMany();
//   });
//   await client.$disconnect();
// });

describe("Form Creation", async () => {
  it("Create Form with empty decision array", async () => {
    client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", []);

      expect(form).toMatchObject({ title: "Title" });
    });
  });

  it("Create Form with decisions", async () => {
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
    await client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", []);

      const result = await findFormByTitle(tx, "Title");

      if (form) {
        expect(result).toMatchObject(form);
      } else {
        throw new Error("findFormByTitle");
      }
    });
  });

  it("Find all forms", async () => {
    await client.$transaction(async (tx) => {
      const form1 = await createForm(tx, "Title5", ["Decision1", "Decision2"]);
      const form2 = await createForm(tx, "Title4", ["Decision3", "Decision4"]);

      const result = await findAllForms(tx);

      expect(result.length).toBe(2);
      expect(result).toMatchObject([form1, form2]);
    });
  });
});

describe("Form Deletion", async () => {
  it("Delete form with decisions", async () => {
    await client.$transaction(async (tx) => {
      const form = await createForm(tx, "Title", ["Decision 1", "Decision 2"]);

      const result = await deleteForm(tx, form.id);
      const decisions = await tx.decision.findMany();

      if (form) {
        expect(result).toMatchObject(form);
        expect(decisions.length).toBe(0);
      } else {
        throw new Error("deleteForm");
      }
    });
  });
});
