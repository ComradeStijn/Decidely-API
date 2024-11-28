import { PrismaClient } from "@prisma/client";
import { createNewUser, createNewUserGroup } from "../../services/userServices";
import { createForm } from "../../services/formServices";
import {
  assignFormToGroup,
  assignFormToUser,
} from "../../services/formAssignService";
import { hasUserVoted, voteUserOnForm } from "../../services/votingServices";

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
  it("Form does not exist", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "Voter Group");
      const user = await createNewUser(tx, "Voter2", 1, group.id);
      const result = await voteUserOnForm(tx, user.id, "231", [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);

      expect(result).toBeNull();
    });
  });

  it("Decision not structured correctly", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "Decision group")
      const user = await createNewUser(tx, "Decision Voter", 1, group.id)
      const form = await createForm(tx, "Decision Form", [
        "Decision 44",
        "Decision 55"
      ])
      await assignFormToGroup(tx, form.id, group.id)

      const result = await voteUserOnForm(tx, user.id, form.id, [
        { decision: "Wrongwrong", amount: 3},
        { decision: "wrongwrongwrong", amount: 1}
      ])
    })
  });

  it("User vote", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "VotingGroup1");
      const user = await createNewUser(tx, "Voter13", 1, group.id);
      const form = await createForm(tx, "Voting Form", [
        "Decision 13",
        "Decision 23",
      ]);
      await assignFormToGroup(tx, form.id, group.id);

      const result = await voteUserOnForm(tx, user.id, form.id, [
        { decision: "Decision 13", amount: 1 },
        { decision: "Decision 23", amount: 2 },
      ]);
      const decision1 = await tx.decision.findFirst({
        where: {
          title: "Decision 13",
        },
      });
      const decision2 = await tx.decision.findFirst({
        where: { title: "Decision 23" },
      });
      if (!decision1 || !decision2) {
        throw new Error("Decision 13 or 23");
      }

      expect(result).not.toBeNull();
      expect(decision1?.votes).toBe(1);
      expect(decision2?.votes).toBe(2);
    });
  });

  it("UserForm gets updated on vote", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "VotingGroup");
      const user = await createNewUser(tx, "Voter145", 1, group.id);
      const form = await createForm(tx, "Voting Form11111", [
        "Decision 1",
        "Decision 2",
      ]);
      await assignFormToGroup(tx, form.id, group.id);

      await voteUserOnForm(tx, user.id, form.id, [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);

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

  it("hasUserVoted", async () => {
    await client.$transaction(async (tx) => {
      const group = await createNewUserGroup(tx, "VotingGroup");
      const user1 = await createNewUser(tx, "Voter123", 1, group.id);
      const form = await createForm(tx, "Voting Form9897", [
        "Decision 1",
        "Decision 2",
      ]);
      await assignFormToGroup(tx, form.id, group.id);

      await voteUserOnForm(tx, user1.id, form.id, [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);
      const user2 = await createNewUser(tx, "Indium", 1);
      await assignFormToUser(tx, form.id, user2.id);
      if (!user1 || !user2 || !form) throw new Error("No user or form");

      const expectTrue = await hasUserVoted(tx, user1.id, form.id);
      const expectFalse = await hasUserVoted(tx, user2.id, form.id);

      expect(expectTrue).toBe(true);
      expect(expectFalse).toBe(false);
    });
  });
});
