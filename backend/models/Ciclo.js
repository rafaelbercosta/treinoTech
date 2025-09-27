import mongoose from "mongoose";

const cycleSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  dataInicio: {
    type: Date,
    required: true,
    default: Date.now
  },
  dataFim: {
    type: Date,
    required: false
  },
  ativo: {
    type: Boolean,
    default: true
  },
  descricao: {
    type: String,
    trim: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para performance
cycleSchema.index({ usuario: 1, ativo: 1 });
cycleSchema.index({ usuario: 1, dataInicio: -1 });

export default mongoose.model('Cycle', cycleSchema);
r