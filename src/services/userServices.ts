import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const client = new PrismaClient();

async function findAllUsers() {
  const result = await client.user.findMany();
  return result;
}

async function findAllUsersByGroup(groupName: string) {
  const users = await client.userGroup.findUnique({
    where: {
      name: groupName,
    },
    select: {
      users: true,
    },
  });
  return users;
}

async function findUserByName(username: string) {
  const result = await client.user.findUnique({
    where: {
      name: username,
    },
  });
  return result;
}

async function createNewUser(
  username: string,
  password: string,
  amount: number,
  userGroup?: string,
  role: string = "user",
  email?: string
) {
  const transaction = await client.$transaction(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await client.user.create({
      data: {
        name: username,
        password: hashedPassword,
        proxyAmount: amount,
        role: role,
        email: email || undefined,
      },
    });

    if (userGroup) {
      const group = await client.userGroup.findFirst({
        where: { name: userGroup },
      });
      if (group) {
        const updatedUser = await client.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            userGroupId: group.id,
          },
        });
        return updatedUser;
      }
    }

    // Enforces many-to-many relationship between all users and all forms in the join table
    const forms = await client.form.findMany();
    if (forms.length > 0) {
      await client.userForm.createMany({
        data: forms.map((form) => ({
          userId: newUser.id,
          formId: form.id,
        })),
      });
    }

    return newUser;
  });
  return transaction;
}

async function createNewUserGroup(groupName: string) {
  const result = await client.userGroup.create({
    data: {
      name: groupName,
    },
  });
  return result;
}

async function deleteUserGroup(groupName: string) {
  const groupWithUsers = await client.userGroup.findUnique({
    where: {
      name: groupName,
    },
    select: {
      users: true,
    },
  });

  if (groupWithUsers && groupWithUsers.users.length === 0) {
    const result = await client.userGroup.delete({
      where: {
        name: groupName,
      },
    });
    return result;
  }
  return null;
}

async function changeUserGroup(username: string, groupname: string) {
  const newGroup = await client.userGroup.findUnique({
    where: { name: groupname },
  });
  const user = await client.user.findUnique({
    where: { name: username },
  });

  if (user && newGroup) {
    const result = await client.user.update({
      where: {
        name: user.name,
      },
      data: {
        userGroup: {
          disconnect: true,
          connect: { id: newGroup.id },
        },
      },
    });
    return result;
  }

  return null;
}

async function changeProxyOfUser(username: string, newAmount: number) {
  const result = await client.user.update({
    where: {
      name: username,
    },
    data: {
      proxyAmount: newAmount,
    },
  });

  if (!result) {
    throw new Error(`Error: Cannot update proxyvotes of user ${username}`);
  }
  return result;
}

async function validateUser(username: string, plainPassword: string) {
  const user = await client.user.findUnique({
    where: {
      name: username,
    },
  });

  if (!user) return false;

  const isMatch = await bcrypt.compare(plainPassword, user.password);
  return isMatch ? user : false;
}
