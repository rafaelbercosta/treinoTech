import express from "express";
import { authMiddleware } from "../middleware.js";
import {
  createCycle,
  getCycles,
  getActiveCycle,
  activateCycle,
  updateCycle,
  deleteCycle
} from "../controllers/cycleController.js";

const router = express.Router();

// Criar novo ciclo
router.post("/", authMiddleware, createCycle);

// Buscar todos os ciclos do usuário
router.get("/", authMiddleware, getCycles);

// Buscar ciclo ativo
router.get("/ativo", authMiddleware, getActiveCycle);

// Ativar um ciclo específico
router.put("/:id/ativar", authMiddleware, activateCycle);

// Atualizar ciclo
router.put("/:id", authMiddleware, updateCycle);

// Deletar ciclo
router.delete("/:id", authMiddleware, deleteCycle);

export default router;
