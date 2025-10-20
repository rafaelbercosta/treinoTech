import jwt from "jsonwebtoken";
import User from "./models/user.js";
import "dotenv/config";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 authMiddleware - Header:', authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('🔐 authMiddleware - Token não fornecido');
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  console.log('🔐 authMiddleware - Token:', token ? 'Presente' : 'Ausente');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 authMiddleware - Token válido, user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('🔐 authMiddleware - Erro ao verificar token:', err.message);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao verificar permissões de administrador" });
  }
};

export { authMiddleware, adminMiddleware };
