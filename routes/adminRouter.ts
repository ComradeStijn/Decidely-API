import { Request, Response, Router } from "express";
import adminViewController from "../controllers/adminViewController";
import adminCreateController from "../controllers/adminCreateController";
import adminAssignController from "../controllers/adminAssignController";

const router = Router();

router.get("/check", (req: Request, res: Response) => {
  console.log("should see");
  res.status(200).json({ success: true, message: "Admin Check Success" });
  return;
});

// Get all Forms
router.get("/forms", adminViewController.getAllForms);

// Create Form
router.post("/forms", adminCreateController.postForm);

// Get all Users
router.get("/users", adminViewController.getAllUsers);

// Create user
router.post("/users", adminCreateController.postUser);

// Assign User to Group
router.post("/users/assign", adminAssignController.putUserToGroup);

// Create Group
router.post("/groups", adminCreateController.postUserGroup);

// Assign Group to Form
router.post("/groups/assign", adminAssignController.putGroupToForm);

export default router;
