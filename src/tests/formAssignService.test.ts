import { PrismaClient } from "@prisma/client";
import {
  assignFormToGroup,
  assignFormToUser,
  removeFormFromGroup,
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

describe("Assiging user to form", async () => {
  it("User gets assigned to form", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn123", 1);
      const form = await createForm(tx, "Form123", ["decision"]);

      await assignFormToUser(tx, form.id, user.id);
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
      expect(userForm.userId).toBe(user.id)
      expect(userForm.formId).toBe(form.id)
      expect(userForm.hasVoted).toBe(false);
    });
  });

  it("Removing form from user", async () => {
    await client.$transaction(async (tx) => {
      const date = Date.now();
      const user = await createNewUser(tx, `Stijn${date}`, 1);
      const form = await createForm(tx, `Title${date}`, ["Decision 1"]);
      await assignFormToUser(tx, form.id, user.id);

      await removeFormFromUser(tx, form.id, user.id)
      const userForms = await tx.userForm.findMany();
      const userAfter = await tx.user.findUnique({
        where: { name: `Stijn${date}` },
        include: { userForm: true },
      });
      const formAfter = await tx.form.findUnique({
        where: { title: `Title${date}` },
        include: { userForms: true },
      });

      expect(userForms.length).toBe(0);
      expect(userAfter?.userForm.length).toBe(0);
      expect(formAfter?.userForms.length).toBe(0);
    });
  });
});

describe("Assign userGroup to Form", async () => {
  it("Assign userGroup to form", async () => {
    client.$transaction(async (tx) => {
      const date = Date.now();
      const group = await createNewUserGroup(tx, `Group${date}`);
      const user = await createNewUser(tx, `Stijn${date}`, 1, `Group${date}`);
      const form = await createForm(tx, `Title${date}`, ["Decision"]);

      const result = await assignFormToGroup(tx, form.id, group.id);
      if (!result) throw new Error("assignFormToGroup");
      const userGroupForm = tx.userGroupForm.findUnique({
        where: {
          groupId_formId: {
            groupId: group.id,
            formId: form.id,
          },
        },
      });
      const userForm = tx.userForm.findUnique({
        where: {
          userId_formId: {
            userId: user.id,
            formId: form.id,
          },
        },
      });

      expect(userGroupForm).not.toBeNull();
      expect(userForm).not.toBeNull();
    });
  });

  it("Assigning group with multiple users to form", async () => {
    client.$transaction(async (tx) => {
      const date = Date.now();
      const group = await createNewUserGroup(tx, `Group${date}`);
      const user1 = await createNewUser(tx, `Stijn${date}`, 2, `Group${date}`);
      const user2 = await createNewUser(tx, `Kean${date}`, 1, `Group${date}`);
      const form = await createForm(tx, `Title${date}`, ["decision 1"]);

      await assignFormToGroup(tx, form.id, group.id);
      const userForms = await tx.userForm.findMany();

      expect(userForms.length).toBe(2);
      expect(userForms).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userId: user1.id, formId: form.id }),
          expect.objectContaining({ userId: user2.id, formId: form.id }),
        ])
      );
    });
  });

  it("Removing form from usergroup", async () => {
    client.$transaction(async (tx) => {
      const date = Date.now();
      const group = await createNewUserGroup(tx, `Group${date}`);
      const user1 = await createNewUser(tx, `Stijn${date}`, 2, `Group${date}`);
      const user2 = await createNewUser(tx, `Kean${date}`, 1, `Group${date}`);
      const form = await createForm(tx, `Title${date}`, ["decision 1"]);
      await assignFormToGroup(tx, form.id, group.id);

      await removeFormFromGroup(tx, form.id, group.id)
      const userForm = await tx.userForm.findMany()
      const userGroupForm = await tx.userGroupForm.findMany()

      expect(userForm.length).toBe(0)
      expect(userGroupForm.length).toBe(0)
    });
  });
});
