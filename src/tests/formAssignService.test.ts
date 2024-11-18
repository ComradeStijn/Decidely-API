import { PrismaClient } from "@prisma/client";
import { assignFormToUser } from "../services/formAssignService";
import { createForm } from "../services/formServices";
import { createNewUser } from "../services/userServices";

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



describe("Assiging user to form", async () => {
  it("User gets assigned to form", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn", 1);
      await createForm(tx, "Form", ["decision"]);

      await assignFormToUser(tx, "Form", "Stijn");
      const form = await tx.form.findUnique({
        where: { title: "Form" },
        include: { userForms: true },
      });
      const user = await tx.user.findUnique({
        where: { name: "Stijn" },
        include: { userForm: true },
      });
      if (!form || !user) return null;
      const userForm = await tx.userForm.findUnique({
        where: {
          userId_formId: {
            userId: user.id,
            formId: form.id,
          },
        },
      });
      expect(userForm).not.toBeNull();
      expect(userForm).toMatchObject(user);
      expect(userForm).toMatchObject(form);
    });
  });
});
