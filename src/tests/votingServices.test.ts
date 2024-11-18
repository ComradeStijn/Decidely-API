import { PrismaClient } from "@prisma/client";
import { createNewUser, createNewUserGroup } from "../services/userServices";
import { createForm } from "../services/formServices";
import { assignFormToGroup, assignFormToUser } from "../services/formAssignService";
import { hasUserVoted, voteUserOnForm } from "../services/votingServices";
import exp from "constants";

let client: PrismaClient;
beforeEach(async () => {
  client = new PrismaClient();

  await client.$transaction(async (tx) => {
    await tx.userForm.deleteMany();
    await tx.userGroup.deleteMany();
    await tx.userGroupForm.deleteMany();
    await tx.decision.deleteMany();
    await tx.form.deleteMany();
    await tx.user.deleteMany();
  });
});

describe("Voting", async () => {
  beforeEach(async () => {
    await client.$transaction(async (tx) => {
      await createNewUserGroup(tx, "VotingGroup");
      await createNewUser(tx, "Voter1", 1, "VotingGroup");
      await createForm(tx, "Voting Form", ["Decision 1", "Decision 2"]);
      await assignFormToGroup(tx, "Voting Form", "VotingGroup");
    });
  });

  it("User vote", async () => {
    await client.$transaction(async (tx) => {
      const result = await voteUserOnForm(tx, "Voter1", "Voting Form", [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);
      const decision1 = await tx.decision.findFirst({
        where: {
          title: "Decision 1",
        },
      });
      const decision2 = await tx.decision.findFirst({
        where: { title: "Decision 2" },
      });
      if (!decision1 || !decision2) {
        throw new Error("Decision 1 or 2");
      }

      expect(result).not.toBeNull();
      expect(decision1?.votes).toBe(1);
      expect(decision2?.votes).toBe(2);
    });
  });

  it("UserForm gets updated on vote", async () => {
    await client.$transaction(async (tx) => {
      await voteUserOnForm(tx, "Voter1", "Voting Form", [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);
      const user = await tx.user.findUnique({ where: { name: "Voter1" } });
      const form = await tx.form.findUnique({
        where: { title: "Voting Form" },
      });
      if (!user || !form) throw new Error("Not user or form");

      const userForm = await tx.userForm.findUnique({
        where: {
          userId_formId: {
            userId: user.id,
            formId: form.id,
          },
        },
      });
      if (!userForm) throw new Error("No userForm");

      expect(userForm.hasVoted).toBe(true);
    });
  });

  it("hasUserVoted", async() => {
    await client.$transaction(async (tx) => {
      await voteUserOnForm(tx, "Voter1", "Voting Form", [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);
      await createNewUser(tx, 'Indium', 1)
      await assignFormToUser(tx, 'Voting Form', 'Indium')

      const expectTrue = await hasUserVoted(tx, 'Voter1', 'Voting Form')
      const expectFalse = await hasUserVoted(tx, 'Indium', 'Voting Form')

      expect(expectTrue).toBe(true)
      expect(expectFalse).toBe(false)
    })
  });
});
