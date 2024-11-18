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
} from "../services/userServices";

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

describe("User creation", async () => {
  it("Create User returns user", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const result = await createNewUser(
        client,
        "Stijn",
        2,
        undefined,
        "test@test.com",
        "user"
      );
      const expectation = {
        name: "Stijn",
        email: "test@test.com",
        role: "user",
        proxyAmount: 2,
        userGroupId: null,
      };

      expect(result).toMatchObject(expectation);
    });
  });

  it("Create Users with existing group", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUserGroup(tx, "Group");
      await createNewUser(tx, "Stijn", 2, "Group");

      const user = await findUserByName(tx, "Stijn");
      const groupUsers = await findAllUsersByGroup(tx, "Group");
      const group = await tx.userGroup.findUnique({
        where: { name: "Group" },
      });

      expect(user?.userGroupId).toBe(group?.id);
      expect(groupUsers?.users.length).toBe(1);
      expect(groupUsers?.users[0].id).toBe(user?.id);
    });
  });
});

describe("User finding", async () => {
  it("Find All Users finds two users", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const user1 = await createNewUser(tx, "Stijn", 2);
      const user2 = await createNewUser(tx, "Kean", 3);
      const result = await findAllUsers(tx);

      expect(result).toStrictEqual([user1, user2]);
    });
  });

  it("Find user by name", async () => {
    const client = new PrismaClient();

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
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const result = await createNewUserGroup(tx, "Test");
      const expectation = {
        name: "Test",
      };

      expect(result).toMatchObject(expectation);
    });
  });

  it("Usergroup assigning", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn", 2);
      await createNewUserGroup(tx, "Group");

      const result = await changeUserGroup(tx, "Stijn", "Group");
      const expectation = await findUserByName(tx, "Stijn");
      if (!expectation) {
        throw new Error("No user found");
      }

      expect(result).toMatchObject(expectation);
    });
  });

  it("Usergroup finding", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn", 1);
      await createNewUser(tx, "Kean", 2);
      await createNewUserGroup(tx, "Group");
      await changeUserGroup(tx, "Stijn", "Group");
      await changeUserGroup(tx, "Kean", "Group");

      const result = await findAllUsersByGroup(tx, "Group");
      const resultId = result?.users.map((user) => user.userGroupId);
      const user1 = await findUserByName(tx, "Stijn");
      const user2 = await findUserByName(tx, "Kean");

      expect(resultId?.length).toBe(2);
      expect(resultId).toStrictEqual([user1?.userGroupId, user2?.userGroupId]);
    });
  });

  it("Usergroup reassigning", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn", 2);
      await createNewUserGroup(tx, "Group 1");
      const group2 = await createNewUserGroup(tx, "Group 2");

      await changeUserGroup(tx, "Stijn", "Group 1");
      await changeUserGroup(tx, "Stijn", "Group 2");
      const user = await findUserByName(tx, "Stijn");

      expect(user?.userGroupId).toBe(group2.id);
    });
  });

  it("Usergroup deleting", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const groupBefore = await createNewUserGroup(tx, "Group");

      const result = await deleteUserGroup(tx, "Group");
      const groupAfter = await findAllUserGroups(tx);

      expect(result).toMatchObject(groupBefore);
      expect(groupAfter).toMatchObject([]);
    });
  });

  it("Usergroup does not delete when user exists", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUserGroup(tx, "Group");
      await createNewUser(tx, "Stijn", 3);
      await changeUserGroup(tx, "Stijn", "Group");

      const result = await deleteUserGroup(tx, "Group");
      const user = await findUserByName(tx, "Stijn");
      const group = await tx.userGroup.findUnique({
        where: { name: "Group" },
      });

      expect(result).toBeNull();
      expect(user?.userGroupId).toBe(group?.id);
    });
  });
});

describe("Editing User", async () => {
  it("Change proxy of user", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn", 1);

      const user = await changeProxyOfUser(tx, "Stijn", 2);

      expect(user.proxyAmount).toBe(2);
    });
  });
});

describe("Delete user", async () => {
  it("Delete user", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);

      const deletedUser = await deleteUser(tx, "Stijn");
      const foundUser = await findUserByName(tx, "Stijn");

      expect(user.id).toBe(deletedUser.id);
      expect(foundUser).toBeNull();
    });
  });

  it("Delete user with group", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      await createNewUser(tx, "Stijn", 2);
      await createNewUserGroup(tx, "Group");
      await changeUserGroup(tx, "Stijn", "Group");

      await deleteUser(tx, "Stijn");
      const groupUsers = await findAllUsersByGroup(tx, "Group");
      const foundUser = await findUserByName(tx, "Stijn");

      expect(groupUsers?.users.length).toBe(0);
      expect(foundUser).toBeNull();
    });
  });
});

describe("User validation", async () => {
  it("Validation", async () => {
    const client = new PrismaClient();

    await client.$transaction(async (tx) => {
      const user = await createNewUser(tx, "Stijn", 2);

      const correctValidation = await validateUser(tx, "Stijn", user.token);
      const falseValidation = await validateUser(tx, "Stijn", "False");

      expect(correctValidation).toStrictEqual(user);
      expect(falseValidation).toBe(false);
    });
  });
});
