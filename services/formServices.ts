import { PrismaClient, Prisma } from "@prisma/client";

export async function findAllForms(client: Prisma.TransactionClient) {
  const result = await client.form.findMany({
    include: {
      decisions: true,
      userForms: {
        select: {
          hasVoted: true,
          user: {
            select: {
              id: true,
              name: true,
              proxyAmount: true
            }
          }
        }
      }
    },
  });
  return result;
}

export async function findAllFormsByUser(
  client: Prisma.TransactionClient,
  userId: string
) {
  const result = await client.userForm.findMany({
    where: {
      userId: userId,
    },
    select: {
      form: {
        include: {
          decisions: true,
        },
      },
    },
  });
  return result;
}

export async function findFormByTitle(
  client: Prisma.TransactionClient,
  title: string
) {
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

export async function createForm(
  client: Prisma.TransactionClient,
  title: string,
  decisions: string[]
) {
  const form = await client.form.create({
    data: {
      title: title,
    },
  });
  await client.decision.createMany({
    data: decisions.map((decision) => ({
      title: decision,
      formId: form.id,
    })),
  });
  const newForm = await client.form.findUnique({
    where: { title: title },
    include: { decisions: true },
  });

  return newForm!;
}

export async function deleteForm(client: Prisma.TransactionClient, id: string) {
  const result = await client.form.delete({
    where: { id: id },
    include: { decisions: true },
  });
  return result;
}
