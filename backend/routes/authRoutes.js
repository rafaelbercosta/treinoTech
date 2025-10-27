import express from "express";
import { registerUser, login, profile, deleteUser, changePassword } from "../controllers/authController.js";
import { authMiddleware } from "../middleware.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.redirect("/login");
});

router.post("/login", login);
router.post("/register", registerUser);
router.get("/user", authMiddleware, profile);
router.delete("/delete-user", deleteUser);
router.put("/change-password", authMiddleware, changePassword);

export default router;
