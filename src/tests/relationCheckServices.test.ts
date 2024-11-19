import { PrismaClient } from "@prisma/client";
import {
  createNewUser,
  createNewUserGroup,
  deleteUser,
  deleteUserGroup,
} from "../services/userServices";
import { createForm } from "../services/formServices";
import { checkRelationUser } from "../services/relationCheckServices";
import { assignFormToGroup } from "../services/formAssignService";

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

describe("Refresh users in userForm", async () => {
  it("Refresh on adding user to group", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "refreshGroup213");
      const user1 = await createNewUser(tx, "refreshUser231", 1, group.id);
      const form = await createForm(tx, "refreshForm231", ["Decision 1"]);
      await assignFormToGroup(tx, form.id, group.id);

      const user2 = await createNewUser(tx, "TestUser1", 1, group.id);


      await checkRelationUser(tx, user2.id, group.id);
      const userForm = await tx.userForm.findUnique({
        where: {
          userId_formId: {
            userId: user2.id,
            formId: form.id,
          },
        },
      });
      const userForms = await tx.userForm.findMany({
        where: {
          formId: form.id
        }
      });

      expect(userForm).not.toBeNull();
      expect(userForms.length).toBe(2);
    });
  });

  it("Deleting user when form assigned", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "refreshGroup");
      const user = await createNewUser(tx, "refreshUser", 1, group.id);
      const form = await createForm(tx, "refreshForm333", ["Decision 1"]);
      await assignFormToGroup(tx, form.id, group.id);

      await deleteUser(tx, user.id);

      const result = await tx.userForm.findMany(({
        where: {
          formId: form.id,
        }
      }));

      expect(result.length).toBe(0);
    });
  });

  it("Deleting usergroup when form assigned", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "refreshGroup444");
      const user = await createNewUser(tx, "refreshUser444", 1, group.id);
      const form = await createForm(tx, "refreshForm444", ["Decision 1"]);
      await assignFormToGroup(tx, form.id, group.id);

      await deleteUser(tx, user.id);
      await deleteUserGroup(tx, group.id);

      const userGroupForm = await tx.userGroupForm.findMany({
        where: {
          formId: form.id
        }
      });
      const userGroup = await tx.userGroup.findMany(({
        where: {
          id: group.id
        }
      }));

      expect(userGroupForm.length).toBe(0);
      expect(userGroup.length).toBe(0);
    });
  });
});
