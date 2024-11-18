import { Prisma } from "@prisma/client";

export async function voteUserOnForm(
  client: Prisma.TransactionClient,
  username: string,
  formname: string,
  votes: {
    decision: string;
    amount: number;
  }[]
) {
  const user = await client.user.findUnique({ where: { name: username } });
  const form = await client.form.findUnique({ where: { title: formname } });
  if (!user || !form) return null;

  await client.userForm.update({
    where: {
      userId_formId: {
        userId: user.id,
        formId: form.id,
      },
    },
    data: {
      hasVoted: true,
    },
  });

  return await Promise.all(
    votes.map((vote) => {
      return client.decision.update({
        where: {
          formId_title: {
            formId: form.id,
            title: vote.decision,
          },
        },
        data: {
          votes: {
            increment: vote.amount,
          },
        },
      });
    })
  );
}

export async function hasUserVoted(
  client: Prisma.TransactionClient,
  username: string,
  formname: string
) {
  const user = await client.user.findUnique({ where: { name: username } });
  const form = await client.form.findUnique({ where: { title: formname } });
  if (!user || !form) return null;

  const userForm = await client.userForm.findUnique({
    where: {
      userId_formId: {
        userId: user.id,
        formId: form.id,
      },
    },
  });
  return userForm?.hasVoted;
}
