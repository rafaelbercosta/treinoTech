import User from '../models/user.js';
import Cycle from '../models/Cycle.js';
import Workout from '../models/workout.js';
import bcrypt from 'bcryptjs';

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

// Criar usuário (admin)
export const createUser = async (req, res) => {
  try {
    const { name, password, isAdmin } = req.body;

    // Validações
    if (!name || !password) {
      return res.status(400).json({ message: "Nome e senha são obrigatórios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Senha deve ter pelo menos 6 caracteres" });
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "Usuário com este nome já existe" });
    }

    const newUser = new User({
      name,
      password,
      isAdmin: isAdmin || false
    });

    await newUser.save();
    
    // Retornar usuário sem senha
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
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

// Alterar senha de usuário (admin)
export const changeUserPassword = async (req, res) => {
  console.log('changeUserPassword chamada com:', req.params, req.body);
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Validações
    if (!newPassword) {
      return res.status(400).json({ message: "Nova senha é obrigatória" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Nova senha deve ter pelo menos 6 caracteres" });
    }

    // Buscar o usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Atualizar a senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Senha alterada com sucesso" });

  } catch (error) {
    console.error("Erro ao alterar senha do usuário:", error);
    res.status(500).json({ message: "Erro no servidor" });
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

// Criar ciclo para usuário (admin)
export const createCycle = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, descricao, usuario, ativo } = req.body;

    // Validações
    if (!nome || !usuario) {
      return res.status(400).json({ message: "Nome e usuário são obrigatórios" });
    }

    // Verificar se o usuário existe
    const user = await User.findById(usuario);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Se o ciclo será ativo, desativar outros ciclos do usuário
    if (ativo) {
      await Cycle.updateMany(
        { usuario: usuario, ativo: true },
        { ativo: false }
      );
    }

    const novoCiclo = new Cycle({
      nome,
      dataInicio: dataInicio ? new Date(dataInicio + 'T00:00:00') : new Date(),
      dataFim: dataFim ? new Date(dataFim + 'T00:00:00') : undefined,
      descricao,
      usuario,
      ativo: ativo || false
    });

    await novoCiclo.save();
    
    // Popular o usuário para retornar
    await novoCiclo.populate('usuario', 'name email');
    
    res.status(201).json(novoCiclo);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar ciclo", error: error.message });
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
    const workouts = await Workout.find()
      .populate('userId', 'name email')
      .populate('cicloId', 'nome')
      .sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar treinos", error: error.message });
  }
};

// Criar treino para usuário (admin)
export const createWorkout = async (req, res) => {
  try {
    const { nome, userId, cicloId } = req.body;

    // Validações
    if (!nome || !userId) {
      return res.status(400).json({ message: "Nome e usuário são obrigatórios" });
    }

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Se cicloId foi fornecido, verificar se existe
    if (cicloId) {
      const ciclo = await Cycle.findById(cicloId);
      if (!ciclo) {
        return res.status(404).json({ message: "Ciclo não encontrado" });
      }
    }

    const novoTreino = new Workout({
      nome,
      userId,
      cicloId: cicloId || undefined,
      exercicios: [],
      historico: []
    });

    await novoTreino.save();
    
    // Popular os dados para retornar
    await novoTreino.populate('userId', 'name email');
    if (cicloId) {
      await novoTreino.populate('cicloId', 'nome');
    }
    
    res.status(201).json(novoTreino);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar treino", error: error.message });
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
