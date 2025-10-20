import User from '../models/user.js';
import Cycle from '../models/Cycle.js';
import Workout from '../models/workout.js';

// Listar todos os usuários
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, resetToken: 0, resetTokenExpiry: 0 })
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
  }
};

// Obter detalhes de um usuário específico
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, { password: 0, resetToken: 0, resetTokenExpiry: 0 });
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Buscar ciclos do usuário
    const cycles = await Cycle.find({ usuario: userId }).sort({ dataInicio: -1 });
    
    // Buscar treinos do usuário
    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });

    res.json({
      user,
      cycles,
      workouts
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
  }
};

// Atualizar usuário
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, isAdmin } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, isAdmin },
      { new: true, select: '-password -resetToken -resetTokenExpiry' }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
  }
};

// Deletar usuário
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Deletar ciclos do usuário
    await Cycle.deleteMany({ usuario: userId });
    
    // Deletar treinos do usuário
    await Workout.deleteMany({ userId });
    
    // Deletar usuário
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Usuário e todos os seus dados foram deletados com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar usuário", error: error.message });
  }
};

// Gerenciar ciclos de usuários
export const getAllCycles = async (req, res) => {
  try {
    const cycles = await Cycle.find()
      .populate('usuario', 'name email')
      .sort({ dataInicio: -1 });
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar ciclos", error: error.message });
  }
};

export const updateCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { nome, dataInicio, dataFim, descricao, ativo } = req.body;

    const cycle = await Cycle.findByIdAndUpdate(
      cycleId,
      { 
        nome, 
        dataInicio: dataInicio ? new Date(dataInicio + 'T00:00:00') : undefined,
        dataFim: dataFim ? new Date(dataFim + 'T00:00:00') : undefined,
        descricao,
        ativo
      },
      { new: true }
    ).populate('usuario', 'name email');

    if (!cycle) {
      return res.status(404).json({ message: "Ciclo não encontrado" });
    }

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar ciclo", error: error.message });
  }
};

export const deleteCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;

    // Deletar treinos associados ao ciclo
    await Workout.deleteMany({ cicloId });
    
    // Deletar ciclo
    const cycle = await Cycle.findByIdAndDelete(cycleId);
    
    if (!cycle) {
      return res.status(404).json({ message: "Ciclo não encontrado" });
    }

    res.json({ message: "Ciclo e treinos associados foram deletados com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar ciclo", error: error.message });
  }
};

// Gerenciar treinos de usuários
export const getAllWorkouts = async (req, res) => {
  try {
    console.log('🔍 getAllWorkouts - Iniciando busca de treinos...');
    const workouts = await Workout.find()
      .populate('userId', 'name email')
      .populate('cicloId', 'nome')
      .sort({ createdAt: -1 });
    console.log('🔍 getAllWorkouts - Treinos encontrados:', workouts.length);
    res.json(workouts);
  } catch (error) {
    console.error('❌ getAllWorkouts - Erro:', error);
    res.status(500).json({ message: "Erro ao buscar treinos", error: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { nome, exercicios, historico } = req.body;

    const workout = await Workout.findByIdAndUpdate(
      workoutId,
      { nome, exercicios, historico },
      { new: true }
    ).populate('userId', 'name email').populate('cicloId', 'nome');

    if (!workout) {
      return res.status(404).json({ message: "Treino não encontrado" });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar treino", error: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;

    const workout = await Workout.findByIdAndDelete(workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: "Treino não encontrado" });
    }

    res.json({ message: "Treino deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar treino", error: error.message });
  }
};

// Estatísticas gerais
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const totalCycles = await Cycle.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    
    // Usuários mais ativos (com mais treinos)
    const mostActiveUsers = await Workout.aggregate([
      { $group: { _id: '$userId', workoutCount: { $sum: 1 } } },
      { $sort: { workoutCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', workoutCount: 1 } }
    ]);

    res.json({
      totalUsers,
      totalAdmins,
      totalCycles,
      totalWorkouts,
      mostActiveUsers
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar estatísticas", error: error.message });
  }
};
