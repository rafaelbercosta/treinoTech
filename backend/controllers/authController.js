import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ name });
    if (existingUser) return res.status(400).json({ message: 'Nome de usuário já existe' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

export const login = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: "Nome de usuário não encontrado" });

    const passwordCorreta = await bcrypt.compare(password, user.password);
    if (!passwordCorreta) return res.status(400).json({ message: "Senha incorreta" });

    const token = generateToken(user._id);
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Erro no login" });
  }
};

export const forgotPassword = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ message: 'Nome de usuário não encontrado.' });
    
    if (!user.email) return res.status(400).json({ message: 'Usuário não possui email cadastrado para recuperação.' });

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendResetTokenEmail(user.email, token);
    res.status(200).json({ message: 'Token enviado por e-mail.' });
  } catch (error) {
    console.error('Erro no forgotPassword:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

export const resetPassword = async (req, res) => {
  const { name, token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      name,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Token inválido ou expirado.' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro no resetPassword:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { name, password, confirmed } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
    }

    // Buscar o usuário pelo nome
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: "Nome de usuário não encontrado" });
    }

    // Verificar se a senha está correta
    const passwordCorreta = await bcrypt.compare(password, user.password);
    if (!passwordCorreta) {
      return res.status(400).json({ message: "Senha incorreta" });
    }

    // Se não foi confirmado, retorna sucesso para mostrar popup de confirmação
    if (!confirmed) {
      return res.status(200).json({ message: "Credenciais válidas. Confirmação necessária." });
    }

    // Se confirmado, deletar o usuário
    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: "Usuário deletado com sucesso" });

  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Nova senha e confirmação não coincidem" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Nova senha deve ter pelo menos 6 caracteres" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "A nova senha deve ser diferente da senha atual" });
    }

    // Buscar o usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Senha atual incorreta" });
    }

    // Atualizar a senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Senha alterada com sucesso" });

  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
