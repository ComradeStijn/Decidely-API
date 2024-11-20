import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const client = new PrismaClient();

async function main() {
  await client.user.deleteMany();
  await client.form.deleteMany();
  await client.userGroup.deleteMany();
  await client.decision.deleteMany();
  await client.userForm.deleteMany();
}

main();
