import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware.js';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser,
  getAllCycles,
  createCycle,
  updateCycle,
  deleteCycle,
  getAllWorkouts,
  createWorkout,
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
router.post('/users', createUser);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/password', changeUserPassword);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Rotas de ciclos
router.get('/cycles', getAllCycles);
router.post('/cycles', createCycle);
router.put('/cycles/:cycleId', updateCycle);
router.delete('/cycles/:cycleId', deleteCycle);

// Rotas de treinos
router.get('/workouts', getAllWorkouts);
router.post('/workouts', createWorkout);
router.put('/workouts/:workoutId', updateWorkout);
router.delete('/workouts/:workoutId', deleteWorkout);

// Estatísticas
router.get('/stats', getStats);

export default router;
