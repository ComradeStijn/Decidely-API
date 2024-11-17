import { PrismaClient } from "@prisma/client";
import {
  changeUserGroup,
  createNewUser,
  createNewUserGroup,
  deleteUserGroup,
  findAllUserGroups,
  findAllUsers,
  findAllUsersByGroup,
  findUserByName,
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
  it("createNewUser returns user", async () => {
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
    await changeUserGroup('Stijn','Group')

    const result = await deleteUserGroup('Group')
    const user = await findUserByName('Stijn')
    const group = await client.userGroup.findUnique({where: {name: 'Group'}})

    expect(result).toBeNull()
    expect(user?.userGroupId).toBe(group?.id)
  });
});
