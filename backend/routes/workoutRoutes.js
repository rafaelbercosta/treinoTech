import express from "express";
import {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
  addExercise,
  updateExercise,
  deleteExercise,
  addHistory,
  deleteHistory,
} from "../controllers/workoutController.js";

import authMiddleware from "../../utils/middleware.js"

const router = express.Router();

router.use(authMiddleware);

router.post("/",authMiddleware, createWorkout);
router.get("/",authMiddleware, getWorkouts);
router.put("/:workoutId", authMiddleware, updateWorkout);
router.delete("/:workoutId", authMiddleware, deleteWorkout);


router.post("/:workoutId/exercises",authMiddleware, addExercise);
router.put("/:workoutId/exercises/:exerciseId",authMiddleware, updateExercise);
router.delete("/:workoutId/exercises/:exerciseId",authMiddleware, deleteExercise);

router.post("/:workoutId/history",authMiddleware, addHistory);
router.delete("/:workoutId/history/:historyId", authMiddleware, deleteHistory);


export default router;
