import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const client = new PrismaClient();

async function findAllUsers() {
  const result = await client.user.findMany();
  return result;
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
  role: string = "user",
  email?: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await client.user.create({
    data: {
      name: username,
      password: hashedPassword,
      proxyAmount: amount,
      role: role,
      email: email || undefined,
    },
  });
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

async function changeProxyOfUser(username: string, newAmount: number) {
  const result = await client.user.update({
    where: {
      name: username
    },
    data: {
      proxyAmount: newAmount
    }
  })

  if (!result) {
    throw new Error(`Error: Cannot update proxyvotes of user ${username}`)
  }
  return result
}
