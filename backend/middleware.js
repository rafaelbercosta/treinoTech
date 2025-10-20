import jwt from "jsonwebtoken";
import User from "./models/user.js";
import "dotenv/config";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'Não definido');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erro ao verificar token:', err.message);
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
