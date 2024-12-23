import { Prisma } from "@prisma/client";

export async function voteUserOnForm(
  client: Prisma.TransactionClient,
  userid: string,
  formid: string,
  votes: {
    decision: string;
    amount: number;
  }[]
) {
  try {
    const alreadyVoted = await client.userForm.findUnique({
      where: {
        userId_formId: {
          userId: userid,
          formId: formid
        }
      }
    })

    if (!alreadyVoted) throw new Error("No userForm found");
    if (alreadyVoted.hasVoted) throw new Error("Already voted")

    await client.userForm.update({
      where: {
        userId_formId: {
          userId: userid,
          formId: formid,
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
              formId: formid,
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
  } catch (e: any) {
    return null;
  }
}

export async function hasUserVoted(
  client: Prisma.TransactionClient,
  userid: string,
  formid: string
) {
  const userForm = await client.userForm.findUnique({
    where: {
      userId_formId: {
        userId: userid,
        formId: formid,
      },
    },
  });
  return userForm?.hasVoted;
}
