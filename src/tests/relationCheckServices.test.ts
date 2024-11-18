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
import exp from "constants";

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
  beforeEach(async () => {
    await client.$transaction(async (tx) => {
      await createNewUserGroup(tx, "refreshGroup");
      await createNewUser(tx, "refreshUser", 1, "refreshGroup");
      await createForm(tx, "refreshForm", ["Decision 1"]);
      await assignFormToGroup(tx, "refreshForm", "refreshGroup");
    });
  });

  it("Refresh on adding user to group", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "TestUser", 1, "refreshGroup");
      const form = await tx.form.findUnique({
        where: { title: "refreshForm" },
      });
      if (!form) throw new Error("No form");

      await checkRelationUser(tx, "TestUser", "refreshGroup");
      const userForm = await tx.userForm.findUnique({
        where: {
          userId_formId: {
            userId: user.id,
            formId: form.id,
          },
        },
      });
      const userForms = await tx.userForm.findMany();

      expect(userForm).not.toBeNull();
      expect(userForms.length).toBe(2);
    });
  });

  it("Deleting user when form assigned", async () => {
    await client.$transaction(async (tx) => {
      await deleteUser(tx, "refreshUser");

      const result = await tx.userForm.findMany();

      expect(result.length).toBe(0);
    });
  });

  it("Deleting usergroup when form assigned", async () => {
    await client.$transaction(async (tx) => {
      await deleteUser(tx, "refreshUser");
      await deleteUserGroup(tx, "refreshGroup");

      const userGroupForm = await tx.userGroupForm.findMany();
      const userGroup = await tx.userGroup.findMany();

      expect(userGroupForm.length).toBe(0);
      expect(userGroup.length).toBe(0);
    });
  });
});
