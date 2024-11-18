import { Prisma, PrismaClient } from "@prisma/client";
import crypto from "crypto";


export async function findAllUsers(client: Prisma.TransactionClient) {
  const result = await client.user.findMany();
  return result;
}

export async function findAllUserGroups(client: Prisma.TransactionClient) {
  const result = await client.userGroup.findMany();
  return result;
}

export async function findAllUsersByGroup(
  client: Prisma.TransactionClient,
  groupName: string
) {
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

export async function findUserByName(
  client: Prisma.TransactionClient,
  username: string
) {
  const result = await client.user.findUnique({
    where: {
      name: username,
    },
  });
  return result;
}

export async function createNewUser(
  client: Prisma.TransactionClient,
  username: string,
  amount: number,
  userGroup?: string,
  email?: string,
  role: string = "user"
) {
  const token = crypto.randomBytes(64).toString("hex");
  const newUser = await client.user.create({
    data: {
      name: username,
      token: token,
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

  return newUser;
}
export async function createNewUserGroup(
  client: Prisma.TransactionClient,
  groupName: string
) {
  const result = await client.userGroup.create({
    data: {
      name: groupName,
    },
  });
  return result;
}

export async function changeUserGroup(
  client: Prisma.TransactionClient,
  username: string,
  groupname: string
) {
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
          connect: { id: newGroup.id },
        },
      },
    });
    return result;
  }
  return null;
}

export async function changeProxyOfUser(
  client: Prisma.TransactionClient,
  username: string,
  newAmount: number
) {
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

export async function deleteUser(
  client: Prisma.TransactionClient,
  username: string
) {
  const result = await client.user.delete({
    where: {
      name: username,
    },
  });
  return result;
}

export async function deleteUserGroup(
  client: Prisma.TransactionClient,
  groupName: string
) {
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

export async function validateUser(
  client: Prisma.TransactionClient,
  username: string,
  token: string
) {
  const user = await client.user.findUnique({
    where: {
      name: username,
    },
  });

  if (!user) return false;

  const isMatch = user.token === token;
  return isMatch ? user : false;
}
