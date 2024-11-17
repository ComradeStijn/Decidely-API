import { client } from "./userServices";

export async function findAllForms() {
  const result = await client.form.findMany({
    include: {
      decisions: true,
    },
  });
  return result;
}

export async function findFormByTitle(title: string) {
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

export async function createForm(title: string, decisions: string[]) {
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
    const result =  await tx.form.findUnique({where: {title: title}, include: {decisions: true}})
    return result;
  });
}
