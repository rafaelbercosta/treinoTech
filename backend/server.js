import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import workouts from "./routes/workoutRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api", authRoutes);
app.use("/api/workouts", workouts);

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
