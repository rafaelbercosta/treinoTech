import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import workouts from "./routes/workoutRoutes.js";
import cycles from "./routes/cycleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Carregar variáveis de ambiente apenas em desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'https://treino-tech.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rota raiz para teste
app.get("/api", (req, res) => {
  res.json({ message: "API funcionando!", status: "ok" });
});

// Rotas
app.use("/api", authRoutes);
app.use("/api/workouts", workouts);
app.use("/api/cycles", cycles);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

// Conexão com o MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado ao MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
  });
