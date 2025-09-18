import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  series: { type: Number, default: 0 },
  repeticoes: { type: Number, default: 0 },
  carga: { type: Number, default: 0 },
  tempoDescanso: { type: String, default: "" },
  observacoes: { type: String, default: "" },
  metodoIntensificacao: { type: String, default: "" },
});

const HistoricoSchema = new mongoose.Schema({
  data: { type: String, required: true },
  observacoes: { type: String, default: "" },
});

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nome: { type: String, required: true },
  exercicios: [ExerciseSchema],
  historico: [HistoricoSchema],
});

export default mongoose.model("Workout", WorkoutSchema);
