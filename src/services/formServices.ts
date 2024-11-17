import { PrismaClient } from "@prisma/client";
import { client } from "./userServices";

async function findAllForms() {
  const result = await client.form.findMany({
    include: {
      decisions: true,
    },
  });
  return result;
}

async function findFormByTitle(title: string) {
  const result = await client.form.findUnique({
    where: {
      title: title,
    },
    include: {
      decisions: true,
    },
  });
  return result;
}

async function createForm(title: string, decisions: string[]) {
  return client.$transaction(async (tx) => {
    const form = await tx.form.create({
      data: {
        title: title,
      },
    });

    await tx.decision.createMany({
      data: decisions.map((decision) => ({
        title: decision,
        formId: form.id,
      })),
    });

    return form;
  });
}
