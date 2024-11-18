import { PrismaClient, Prisma } from "@prisma/client";

export async function assignFormToUser(client: Prisma.TransactionClient, formname: string, username: string) {
  const form = await client.form.findUnique({
    where: {
      title: formname,
    },
  });
  const user = await client.user.findUnique({
    where: {
      name: username,
    },
  });

  if (!form || !user) return null;

  const result = await client.userForm.create({
    data: {
      formId: form.id,
      userId: user.id,
    },
  });
  return result;
}
