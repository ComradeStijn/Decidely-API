import { PrismaClient } from "@prisma/client";
import { createNewUser, createNewUserGroup } from "../services/userServices";
import { createForm } from "../services/formServices";
import {
  assignFormToGroup,
  assignFormToUser,
} from "../services/formAssignService";
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
      const group = await createNewUserGroup(tx, "VotingGroup");
      const user = await createNewUser(tx, "Voter1", 1, "VotingGroup");
      const form = await createForm(tx, "Voting Form", [
        "Decision 1",
        "Decision 2",
      ]);
      await assignFormToGroup(tx, form.id, group.id);
    });
  });

  it("User vote", async () => {
    await client.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { name: "Voter1" } });
      const form = await tx.form.findUnique({
        where: { title: "Voting Form" },
      });
      if (!user || !form) throw new Error("No user or form");
      const result = await voteUserOnForm(tx, user.id, form.id, [
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
      const user = await tx.user.findUnique({ where: { name: "Voter1" } });
      const form = await tx.form.findUnique({
        where: { title: "Voting Form" },
      });
      if (!user || !form) throw new Error("No user or form");
      await voteUserOnForm(tx, user.id, form.id, [
        { decision: "Decision 1", amount: 1 },
        { decision: "Decision 2", amount: 2 },
      ]);

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

  it("hasUserVoted", async () => {
    await client.$transaction(async (tx) => {
      const user1 = await tx.user.findUnique({ where: { name: "Voter1" } });
      const form = await tx.form.findUnique({
        where: { title: "Voting Form" },
      });
      if (!user1 || !form) throw new Error("No user or form");
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
