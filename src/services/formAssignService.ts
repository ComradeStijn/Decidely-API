import { PrismaClient, Prisma } from "@prisma/client";

export async function assignFormToGroup(
  client: Prisma.TransactionClient,
  formname: string,
  groupname: string
) {
  const group = await client.userGroup.findUnique({
    where: { name: groupname },
    include: { users: true },
  });
  const form = await client.form.findUnique({ where: { title: formname } });

  if (!form || !group) return null;

  const result = await client.userGroupForm.create({
    data: {
      formId: form.id,
      groupId: group.id,
    },
  });

  await Promise.all(
    group.users.map((user) => assignFormToUser(client, formname, user.name))
  );

  return result;
}

export async function assignFormToUser(
  client: Prisma.TransactionClient,
  formname: string,
  username: string
) {
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

export async function removeFormFromGroup(
  client: Prisma.TransactionClient,
  formname: string,
  groupname: string
) {
  const group = await client.userGroup.findUnique({ where: { name: groupname }, include: {users: true} });
  const form = await client.form.findUnique({ where: { title: formname } });

  if (!group || !form) return null;

  await Promise.all(
    group.users.map(user => removeFormFromUser(client, formname, user.name))
  )
}

export async function removeFormFromUser(
  client: Prisma.TransactionClient,
  formname: string,
  username: string
) {
  const user = await client.user.findUnique({ where: { name: username } });
  const form = await client.form.findUnique({ where: { title: formname } });

  if (!user || !form) return null;

  const result = await client.userForm.delete({
    where: {
      userId_formId: {
        userId: user.id,
        formId: form.id,
      },
    },
  });

  return result;
}
