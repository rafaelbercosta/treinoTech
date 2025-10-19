import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllCycles,
  updateCycle,
  deleteCycle,
  getAllWorkouts,
  updateWorkout,
  deleteWorkout,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authMiddleware);
router.use(adminMiddleware);

// Rotas de usuários
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Rotas de ciclos
router.get('/cycles', getAllCycles);
router.put('/cycles/:cycleId', updateCycle);
router.delete('/cycles/:cycleId', deleteCycle);

// Rotas de treinos
router.get('/workouts', getAllWorkouts);
router.put('/workouts/:workoutId', updateWorkout);
router.delete('/workouts/:workoutId', deleteWorkout);

// Estatísticas
router.get('/stats', getStats);

export default router;
