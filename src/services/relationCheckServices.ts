import { Prisma } from "@prisma/client";
import { assignFormToUser } from "./formAssignService";

export async function checkRelationUser(
  client: Prisma.TransactionClient,
  username: string,
  groupname: string
) {
  const group = await client.userGroup.findUnique({
    where: {
      name: groupname,
    },
  });
  if (!group) return null;

  const formList = await client.userGroupForm.findMany({
    where: {
      groupId: group.id,
    },
    include: {
      form: true,
    },
  });

  const result = await Promise.all(
    formList.map((form) => assignFormToUser(client, form.form.title, username))
  );
  return result;
}

