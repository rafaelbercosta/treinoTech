import express from "express";
import { registerUser, login, profile, deleteUser } from "../controllers/authController.js";
import middleware from "../middleware.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.redirect("/login");
});

router.post("/login", login);
router.post("/register", registerUser);
router.get("/user", middleware, profile);
router.delete("/delete-user", deleteUser);

export default router;
