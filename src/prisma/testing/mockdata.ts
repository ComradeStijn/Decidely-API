import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const client = new PrismaClient();

async function main() {
  await client.user.deleteMany();
  await client.form.deleteMany();
  await client.userGroup.deleteMany();

  await client.user.createMany({
    data: [
      {
        name: "Stijn",
        password: "test",
        role: "user",
        proxyAmount: 3,
      },
      {
        name: "Kean",
        password: "test",
        role: "admin",
        proxyAmount: 1,
      },
    ],
  });

  await client.form.createMany({
    data: [
      {
        title: "Test Form",
      },
      {
        title: "2test form"
      }
    ],
  });

  const form1 = await client.form.findFirst({
    where: {
      title: "Test Form"
    }
  })

  if (!form1) {
    throw new Error("Error finding first form")
  }

  await client.decision.createMany({
    data: [
      {
        title: "Decision 1",
        formId: form1.id
      },
      {
        title: "Decision 2",
        formId: form1.id
      }
    ],
  })  

  const users = await client.user.findMany()
  const forms = await client.form.findMany()

  users.forEach(async (user) => {
    await client.userForm.createMany({
      data: forms.map(form => ({
        userId: user.id,
        formId: form.id
      }))
    })
  })

  const result = await client.user.findMany();
  console.log("Users: ", result);

  const result2 = await client.form.findMany({
    include: {
      decisions: true,
    }
  });
  console.log("Forms: ", JSON.stringify(result2, null, 2));

  const table = await client.userForm.findMany();
  console.log("Join table: ", table);

  const queryResult = await client.user.findFirst({
    include: {
      userForm: {
        include: {
          form: {
            include: {
              decisions: true
            }
          }
        }
      }
    }
  })

  console.log('Test Query: See all forms of first user with their decisions: ', JSON.stringify(queryResult, null, 2))
}

main();
