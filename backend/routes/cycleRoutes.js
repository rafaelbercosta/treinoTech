import express from "express";
import auth from "../middleware.js";
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
router.post("/", auth, createCycle);

// Buscar todos os ciclos do usuário
router.get("/", auth, getCycles);

// Buscar ciclo ativo
router.get("/ativo", auth, getActiveCycle);

// Ativar um ciclo específico
router.put("/:id/ativar", auth, activateCycle);

// Atualizar ciclo
router.put("/:id", auth, updateCycle);

// Deletar ciclo
router.delete("/:id", auth, deleteCycle);

export default router;
