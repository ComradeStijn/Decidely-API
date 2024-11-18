import { Prisma } from "@prisma/client";
import { assignFormToUser } from "./formAssignService";

export async function checkRelationUser(
  client: Prisma.TransactionClient,
  userid: string,
  groupid: string
) {

  const formList = await client.userGroupForm.findMany({
    where: {
      groupId: groupid,
    },
    include: {
      form: true,
    },
  });

  const result = await Promise.all(
    formList.map((form) => assignFormToUser(client, form.form.id, userid))
  );
  return result;
}

