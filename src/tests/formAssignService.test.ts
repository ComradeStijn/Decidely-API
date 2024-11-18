import { PrismaClient } from "@prisma/client";
import {
  assignFormToGroup,
  assignFormToUser,
  removeFormFromUser,
} from "../services/formAssignService";
import { createForm } from "../services/formServices";
import { createNewUser, createNewUserGroup } from "../services/userServices";

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

afterEach(async () => {
  await client.$transaction(async (tx) => {
    await tx.userForm.deleteMany();
    await tx.userGroup.deleteMany();
    await tx.userGroupForm.deleteMany();
    await tx.decision.deleteMany();
    await tx.form.deleteMany();
    await tx.user.deleteMany();
  });
  await client.$disconnect();
});

describe("Assiging user to form", async () => {
  it("User gets assigned to form", async () => {
    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn123", 1);
      await createForm(tx, "Form123", ["decision"]);

      await assignFormToUser(tx, "Form123", "Stijn123");
      const form = await tx.form.findUnique({
        where: { title: "Form123" },
        include: { userForms: true },
      });
      const user = await tx.user.findUnique({
        where: { name: "Stijn123" },
        include: { userForm: true },
      });
      if (!form || !user) {
        throw new Error("form or user");
      }
      const userForm = await tx.userForm.findUnique({
        where: {
          userId_formId: {
            userId: user.id,
            formId: form.id,
          },
        },
      });
      if (!userForm) {
        throw new Error("userForm");
      }

      expect(userForm).not.toBeNull();
      expect(userForm).toMatchObject(user.userForm[0]);
      expect(userForm).toMatchObject(form.userForms[0]);
      expect(userForm.hasVoted).toBe(false);
    });
  });

  it("Removing form from user", async () => {
    await client.$transaction(async (tx) => {
      const date = Date.now()
      await createNewUser(tx, `Stijn${date}`, 1);
      await createForm(tx, `Title${date}`, ["Decision 1"]);
      await assignFormToUser(tx, `Title${date}`, `Stijn${date}`);

      const action = await removeFormFromUser(tx, `Title${date}`, `Stijn${date}`);
      if (!action) {
        throw new Error("removeFormFromUser");
      }
      const userForms = await tx.userForm.findMany();
      const user = await tx.user.findUnique({
        where: { name: `Stijn${date}` },
        include: { userForm: true },
      });
      const form = await tx.form.findUnique({
        where: { title: `Title${date}` },
        include: { userForms: true },
      });

      expect(userForms.length).toBe(0);
      expect(user?.userForm.length).toBe(0);
      expect(form?.userForms.length).toBe(0);
    });
  });
});

// describe('Assign userGroup to Form', async () => {
//   it('Assign userGroup to form', async () => {

//     client.$transaction(async (tx) => {
//       await createNewUserGroup(tx, 'Group')
//       await createNewUser(tx, 'Stijn', 1, 'Group')
//       await createForm(tx, 'Title', ['Decision'])

//       const result = await assignFormToGroup(tx, 'Title', 'Group')
//       if (!result) throw new Error("assignFormToGroup")
//     })
//   })
// })
