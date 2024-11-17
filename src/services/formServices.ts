import { PrismaClient } from "@prisma/client";
import { client } from "./userServices";

async function findAllForms() {
  const result = await client.form.findMany()
  return result
}

async function findFormByTitle(title: string) {
  const result = await client.form.findUnique({
    where: {
      title: title
    }
  })
  return result
}


