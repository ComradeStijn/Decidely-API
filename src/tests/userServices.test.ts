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

const client = new PrismaClient();

beforeEach(async () => {
  await client.decision.deleteMany();
  await client.user.deleteMany();
  await client.userForm.deleteMany();
  await client.userGroup.deleteMany();
  await client.userGroupForm.deleteMany();
  await client.form.deleteMany();
});

describe("User creation", async () => {
  it("Create User returns user", async () => {
    const result = await createNewUser(
      "Stijn",
      "password",
      2,
      undefined,
      "user",
      "test@test.com"
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

  it("Create Users with existing group", async () => {
    await createNewUserGroup("Group");
    await createNewUser("Stijn", "password", 2, "Group");

    const user = await findUserByName("Stijn");
    const groupUsers = await findAllUsersByGroup("Group");
    const group = await client.userGroup.findUnique({
      where: { name: "Group" },
    });

    expect(user?.userGroupId).toBe(group?.id);
    expect(groupUsers?.users.length).toBe(1);
    expect(groupUsers?.users[0].id).toBe(user?.id);
  });
});

describe("User finding", async () => {
  it("Find All Users finds two users", async () => {
    const user1 = await createNewUser("Stijn", "password", 2);
    const user2 = await createNewUser("Kean", "test", 3);
    const result = await findAllUsers();

    expect(result).toStrictEqual([user1, user2]);
  });

  it("Find user by name", async () => {
    const user1 = await createNewUser("Stijn", "password", 2);
    await createNewUser("Kean", "test", 3);
    const result = await findUserByName("Stijn");

    expect(result).toStrictEqual(user1);
  });
});

describe("Usergroup", async () => {
  it("Usergroup creation", async () => {
    const result = await createNewUserGroup("Test");
    const expectation = {
      name: "Test",
    };

    expect(result).toMatchObject(expectation);
  });

  it("Usergroup assigning", async () => {
    await createNewUser("Stijn", "test", 2);
    await createNewUserGroup("Group");

    const result = await changeUserGroup("Stijn", "Group");
    const expectation = await findUserByName("Stijn");
    if (!expectation) {
      throw new Error("No user found");
    }

    expect(result).toMatchObject(expectation);
  });

  it("Usergroup finding", async () => {
    await createNewUser("Stijn", "test", 1);
    await createNewUser("Kean", "Test", 2);
    await createNewUserGroup("Group");
    await changeUserGroup("Stijn", "Group");
    await changeUserGroup("Kean", "Group");

    const result = await findAllUsersByGroup("Group");
    const resultId = result?.users.map((user) => user.userGroupId);
    const user1 = await findUserByName("Stijn");
    const user2 = await findUserByName("Kean");

    expect(resultId?.length).toBe(2);
    expect(resultId).toStrictEqual([user1?.userGroupId, user2?.userGroupId]);
  });

  it("Usergroup reassigning", async () => {
    await createNewUser("Stijn", "test", 2);
    await createNewUserGroup("Group 1");
    const group2 = await createNewUserGroup("Group 2");

    await changeUserGroup("Stijn", "Group 1");
    await changeUserGroup("Stijn", "Group 2");
    const user = await findUserByName("Stijn");

    expect(user?.userGroupId).toBe(group2.id);
  });

  it("Usergroup deleting", async () => {
    const groupBefore = await createNewUserGroup("Group");

    const result = await deleteUserGroup("Group");
    const groupAfter = await findAllUserGroups();

    expect(result).toMatchObject(groupBefore);
    expect(groupAfter).toMatchObject([]);
  });

  it("Usergroup does not delete when user exists", async () => {
    await createNewUserGroup("Group");
    await createNewUser("Stijn", "password", 3);
    await changeUserGroup("Stijn", "Group");

    const result = await deleteUserGroup("Group");
    const user = await findUserByName("Stijn");
    const group = await client.userGroup.findUnique({
      where: { name: "Group" },
    });

    expect(result).toBeNull();
    expect(user?.userGroupId).toBe(group?.id);
  });
});

describe("Editing User", async () => {
  it("Change proxy of user", async () => {
    await createNewUser("Stijn", "password", 1);

    const user = await changeProxyOfUser("Stijn", 2);

    expect(user.proxyAmount).toBe(2);
  });
});

describe("Delete user", async () => {
  it("Delete user", async () => {
    const user = await createNewUser('Stijn', 'test', 2)

    const deletedUser = await deleteUser('Stijn')
    const foundUser = await findUserByName('Stijn')

    expect(user.id).toBe(deletedUser.id)
    expect(foundUser).toBeNull()
  })

  it("Delete user with group", async() => {
    await createNewUser('Stijn', 'test', 2)
    await createNewUserGroup('Group')
    await changeUserGroup('Stijn', 'Group')

    await deleteUser('Stijn')
    const groupUsers = await findAllUsersByGroup('Group')
    const foundUser = await findUserByName('Stijn')

    expect(groupUsers?.users.length).toBe(0)
    expect(foundUser).toBeNull()
  })
})

describe('User validation', async () => {
  it("Validation", async () => {
    const user = await createNewUser('Stijn', 'test', 2)

    const correctValidation = await validateUser('Stijn', 'test')
    const falseValidation = await validateUser('Stijn', 'False')

    expect(correctValidation).toStrictEqual(user)
    expect(falseValidation).toBe(false)
  })
})