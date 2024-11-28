import { PrismaClient } from "@prisma/client";
import {
  changeProxyOfUser,
  changeUserGroup,
  createNewUser,
  createNewUserGroup,
  deleteUser,
  deleteUserGroup,
  findAllUserGroups,
  findAllUsers,
  findAllUsersByGroup,
  findUserByName,
  validateUser,
} from "../../services/userServices";

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

describe("User creation", async () => {
  it("Create User returns user", async () => {
    await client.$transaction(async (tx) => {
      const result = await createNewUser(
        tx,
        "Stijn3",
        2,
        undefined,
        "test@test.com",
        "user"
      );
      const expectation = {
        name: "Stijn3",
        email: "test@test.com",
        role: "user",
        proxyAmount: 2,
        userGroupId: null,
      };

      expect(result).toMatchObject(expectation);
    });
  });

  it("Create Users with existing group", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "Group");
      await createNewUser(tx, "Stijn2", 2, group.id);

      const user = await findUserByName(tx, "Stijn2");
      const groupUsers = await findAllUsersByGroup(tx, "Group");
      expect(user?.userGroupId).toBe(group?.id);
      expect(groupUsers?.users.length).toBe(1);
      expect(groupUsers?.users[0].id).toBe(user?.id);
    });
  });
});

describe("User finding", async () => {
  it("Find All Users finds two users", async () => {
    await client.$transaction(async (tx) => {
      const user1 = await createNewUser(tx, "Stijn", 2);
      const user2 = await createNewUser(tx, "Kean", 3);
      const result = await findAllUsers(tx);

      expect(
        result.sort((a, b) => -a.name.localeCompare(b.name))
      ).toStrictEqual([user1, user2]);
    });
  });

  it("Find user by name", async () => {
    await client.$transaction(async (tx) => {
      const user1 = await createNewUser(tx, "Stijn", 2);
      await createNewUser(tx, "Kean", 3);
      const result = await findUserByName(tx, "Stijn");

      expect(result).toStrictEqual(user1);
    });
  });
});

describe("Usergroup", async () => {
  it("Usergroup creation", async () => {
    await client.$transaction(async (tx) => {
      const result = await createNewUserGroup(tx, "Test");
      const expectation = {
        name: "Test",
      };

      expect(result).toMatchObject(expectation);
    });
  });

  it("Usergroup assigning", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);
      const group = await createNewUserGroup(tx, "Group");

      const result = await changeUserGroup(tx, user.id, group.id);
      const expectation = await findUserByName(tx, "Stijn");
      if (!expectation) {
        throw new Error("No user found");
      }

      expect(result).toMatchObject(expectation);
    });
  });

  it("Usergroup finding", async () => {
    await client.$transaction(async (tx) => {
      const user1 = await createNewUser(tx, "Stijn", 1);
      const user2 = await createNewUser(tx, "Kean", 2);
      const group = await createNewUserGroup(tx, "Group");
      await changeUserGroup(tx, user1.id, group.id);
      await changeUserGroup(tx, user2.id, group.id);

      const result = await findAllUsersByGroup(tx, "Group");
      const resultId = result?.users.map((user) => user.userGroupId);
      const user1update = await findUserByName(tx, "Stijn");
      const user2update = await findUserByName(tx, "Kean");
      if (!user1update || !user2update || !resultId)
        throw new Error("No user1 or user2");

      expect(resultId.length).toBe(2);
      expect(resultId).toStrictEqual([
        user1update.userGroupId,
        user2update.userGroupId,
      ]);
    });
  });

  it("Usergroup reassigning", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);
      const group1 = await createNewUserGroup(tx, "Group 1");
      const group2 = await createNewUserGroup(tx, "Group 2");

      await changeUserGroup(tx, user.id, group1.id);
      await changeUserGroup(tx, user.id, group2.id);
      const userUpdate = await findUserByName(tx, "Stijn");
      const group1Update = await findAllUsersByGroup(tx, "Group 1");
      if (!userUpdate || !group1Update) throw new Error("No userUpdate");

      expect(group1Update.users.length).toBe(0);
      expect(userUpdate.userGroupId).toBe(group2.id);
    });
  });

  it("Usergroup deleting", async () => {
    await client.$transaction(async (tx) => {
      const groupBefore = await createNewUserGroup(tx, "Group");

      const result = await deleteUserGroup(tx, groupBefore.id);
      const groupAfter = await findAllUserGroups(tx);

      expect(result).toMatchObject(groupBefore);
      expect(groupAfter).toMatchObject([]);
    });
  });

  it("Usergroup does not delete when user exists", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "Group");
      const user = await createNewUser(tx, "Stijn", 3);
      await changeUserGroup(tx, user.id, group.id);

      const result = await deleteUserGroup(tx, "Group");
      const userAfter = await findUserByName(tx, "Stijn");
      if (!userAfter) throw new Error("userAfter");

      expect(result).toBeNull();
      expect(userAfter.userGroupId).toBe(group?.id);
    });
  });
});

describe("Editing User", async () => {
  it("Change proxy of user", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 1);

      const result = await changeProxyOfUser(tx, user.id, 2);
      const check = await tx.user.findUnique({ where: { id: user.id } });
      if (!check) throw new Error("No check");

      expect(result.proxyAmount).toBe(2);
      expect(check.proxyAmount).toBe(2);
    });
  });
});

describe("Delete user", async () => {
  it("Delete user", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);

      const deletedUser = await deleteUser(tx, user.id);
      const foundUser = await findUserByName(tx, "Stijn");

      expect(user.id).toBe(deletedUser.id);
      expect(foundUser).toBeNull();
    });
  });

  it("Delete user with group", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);
      const group = await createNewUserGroup(tx, "Group");
      await changeUserGroup(tx, user.id, group.id);

      await deleteUser(tx, user.id);
      const groupUsers = await findAllUsersByGroup(tx, "Group");
      const foundUser = await findUserByName(tx, "Stijn");

      expect(groupUsers?.users.length).toBe(0);
      expect(foundUser).toBeNull();
    });
  });
});

describe("User validation", async () => {
  it("Validation", async () => {
    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);

      const correctValidation = await validateUser(tx, "Stijn", user.token);
      const falseValidation = await validateUser(tx, "Stijn", "False");

      expect(correctValidation).toStrictEqual(user);
      expect(falseValidation).toBe(false);
    });
  });
});
