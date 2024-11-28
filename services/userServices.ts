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

export async function findUserById(
  client: Prisma.TransactionClient,
  userid: string
) {
  const result = await client.user.findUnique({
    where: {
      id: userid,
    },
  });
  return result;
}

export async function createNewUser(
  client: Prisma.TransactionClient,
  username: string,
  amount: number,
  userGroupId?: string,
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

  if (userGroupId) {
    const updatedUser = await client.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        userGroupId: userGroupId,
      },
    });
    return updatedUser;
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
  userid: string,
  newGroupid: string
) {
  const result = await client.user.update({
    where: {
      id: userid,
    },
    data: {
      userGroup: {
        connect: { id: newGroupid },
      },
    },
  });
  return result;
}

export async function changeProxyOfUser(
  client: Prisma.TransactionClient,
  userid: string,
  newAmount: number
) {
  const result = await client.user.update({
    where: {
      id: userid,
    },
    data: {
      proxyAmount: newAmount,
    },
  });
  return result;
}

export async function deleteUser(
  client: Prisma.TransactionClient,
  userid: string
) {
  const result = await client.user.delete({
    where: {
      id: userid,
    },
  });
  return result;
}

export async function deleteUserGroup(
  client: Prisma.TransactionClient,
  groupid: string
) {
  const groupWithUsers = await client.userGroup.findUnique({
    where: {
      id: groupid,
    },
    select: {
      users: true,
    },
  });

  if (groupWithUsers && groupWithUsers.users.length === 0) {
    const result = await client.userGroup.delete({
      where: {
        id: groupid,
      },
    });
    return result;
  }

  return null;
}

export async function validateUser(
  client: Prisma.TransactionClient,
  userName: string,
  token: string
) {
  const user = await client.user.findUnique({
    where: {
      name: userName,
    },
  });

  if (!user) return false;

  const isMatch = user.token === token;
  return isMatch ? user : false;
}
