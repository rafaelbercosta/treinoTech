# Sistema de Administração - Documentação Técnica Detalhada

## Visão Geral

O sistema de administração do Treino Tech é uma aplicação web full-stack que permite aos administradores gerenciar usuários, ciclos de treino e treinos de forma centralizada. O sistema utiliza uma arquitetura moderna com separação clara entre frontend (Next.js) e backend (Node.js/Express), com autenticação baseada em JWT e autorização por níveis de acesso.

## Arquitetura do Sistema

### Stack Tecnológica

**Backend:**
- Node.js + Express.js
- MongoDB com Mongoose ODM
- JWT para autenticação
- bcrypt para hash de senhas
- dotenv para variáveis de ambiente

**Frontend:**
- Next.js 15.3.5 (React framework)
- Tailwind CSS para estilização
- Custom hooks para gerenciamento de estado
- Context API para estado global

### Estrutura de Diretórios

```
treinoTech/
├── backend/
│   ├── controllers/     # Lógica de negócio
│   ├── models/         # Schemas do MongoDB
│   ├── routes/         # Definição de rotas
│   ├── middleware.js   # Middlewares de autenticação
│   └── server.js       # Servidor principal
├── frontend/next/
│   ├── src/
│   │   ├── app/admin/  # Páginas administrativas
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utilitários
└── utils/              # Utilitários compartilhados
```

## Sistema de Autenticação e Autorização

### 1. Modelo de Usuário

```javascript
// backend/models/user.js
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  resetTokenExpiry: Date,
});
```

**Características:**
- Campo `isAdmin` determina privilégios administrativos
- Senhas são automaticamente hasheadas com bcrypt
- Tokens de reset para recuperação de senha
- Validação de unicidade no nome de usuário

### 2. Middleware de Autenticação

```javascript
// backend/middleware.js
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
```

### 3. Middleware de Autorização Admin

```javascript
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: "Erro ao verificar permissões de administrador" 
    });
  }
};
```

**Fluxo de Autenticação:**
1. Usuário faz login com nome e senha
2. Sistema verifica credenciais e gera JWT
3. Token é armazenado no localStorage do frontend
4. Todas as requisições subsequentes incluem o token no header
5. Middleware valida o token e extrai informações do usuário
6. Middleware admin verifica se o usuário tem privilégios administrativos

## Funcionalidades Administrativas

### 1. Dashboard Principal (`/admin`)

**Componente:** `frontend/next/src/app/admin/page.jsx`

**Funcionalidades:**
- Exibição de estatísticas gerais do sistema
- Cards de navegação para diferentes seções
- Lista de usuários mais ativos
- Verificação automática de privilégios admin

**Estatísticas Exibidas:**
- Total de usuários
- Total de administradores
- Total de ciclos
- Total de treinos
- Ranking de usuários mais ativos

**API Endpoint:** `GET /api/admin/stats`

```javascript
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
```

### 2. Gerenciamento de Usuários (`/admin/users`)

**Componente:** `frontend/next/src/app/admin/users/page.jsx`

**Funcionalidades:**
- Listagem de todos os usuários
- Criação de novos usuários
- Edição de informações do usuário
- Alteração de senhas
- Exclusão de usuários
- Visualização de detalhes completos

**Operações CRUD:**

#### Listar Usuários
**API:** `GET /api/admin/users`
```javascript
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, resetToken: 0, resetTokenExpiry: 0 })
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
  }
};
```

#### Criar Usuário
**API:** `POST /api/admin/users`
```javascript
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
```

#### Alterar Senha
**API:** `PUT /api/admin/users/:userId/password`
```javascript
export const changeUserPassword = async (req, res) => {
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
    res.status(500).json({ message: "Erro no servidor" });
  }
};
```

#### Excluir Usuário
**API:** `DELETE /api/admin/users/:userId`
```javascript
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
```

### 3. Gerenciamento de Ciclos (`/admin/cycles`)

**Funcionalidades:**
- Visualização de todos os ciclos do sistema
- Criação de ciclos para usuários específicos
- Edição de ciclos existentes
- Exclusão de ciclos (com exclusão em cascata dos treinos)

**Modelo de Ciclo:**
```javascript
// backend/models/Cycle.js
const CycleSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  dataInicio: { type: Date, required: true },
  dataFim: Date,
  descricao: String,
  ativo: { type: Boolean, default: false },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
```

**Operações Principais:**

#### Criar Ciclo
**API:** `POST /api/admin/cycles`
```javascript
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
```

### 4. Gerenciamento de Treinos (`/admin/workouts`)

**Funcionalidades:**
- Visualização de todos os treinos do sistema
- Filtros por usuário e ciclo
- Criação de treinos para usuários específicos
- Associação de treinos a ciclos
- Edição e exclusão de treinos

**Modelo de Treino:**
```javascript
// backend/models/workout.js
const WorkoutSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cicloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle' },
  exercicios: [ExerciseSchema],
  historico: [HistoricoSchema]
});
```

**Funcionalidades Avançadas:**

#### Filtros Dinâmicos
O sistema implementa filtros em cascata:
1. Seleção de usuário carrega ciclos disponíveis
2. Seleção de ciclo filtra treinos específicos
3. Interface responsiva com estados de loading

```javascript
// Frontend - Lógica de filtros
const fetchCycles = async (userId) => {
  if (!userId) {
    setCycles([]);
    return;
  }
  
  setLoadingCycles(true);
  try {
    const data = await fetchWithAuth(`${API_URL}/api/admin/cycles?usuario=${userId}`);
    setCycles(data);
  } catch (error) {
    console.error('Erro ao buscar ciclos:', error);
  } finally {
    setLoadingCycles(false);
  }
};

const filteredWorkouts = workouts.filter(workout => {
  const matchesUser = !selectedUserId || workout.userId._id === selectedUserId;
  const matchesCycle = !selectedCycleId || workout.cicloId?._id === selectedCycleId;
  return matchesUser && matchesCycle;
});
```

#### Criação de Treinos com Ciclo
**API:** `POST /api/admin/workouts`
```javascript
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
```

## Sistema de Roteamento e Middleware

### Configuração de Rotas Admin

```javascript
// backend/routes/adminRoutes.js
import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware.js';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser,
  getAllCycles,
  createCycle,
  updateCycle,
  deleteCycle,
  getAllWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authMiddleware);
router.use(adminMiddleware);

// Rotas de usuários
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.put('/users/:userId/password', changeUserPassword);
router.delete('/users/:userId', deleteUser);

// Rotas de ciclos
router.get('/cycles', getAllCycles);
router.post('/cycles', createCycle);
router.put('/cycles/:cycleId', updateCycle);
router.delete('/cycles/:cycleId', deleteCycle);

// Rotas de treinos
router.get('/workouts', getAllWorkouts);
router.post('/workouts', createWorkout);
router.put('/workouts/:workoutId', updateWorkout);
router.delete('/workouts/:workoutId', deleteWorkout);

// Estatísticas
router.get('/stats', getStats);

export default router;
```

### Proteção de Rotas Frontend

```javascript
// Frontend - Verificação de privilégios admin
useEffect(() => {
  if (!loading && (!user || !user.isAdmin)) {
    router.push('/login');
    return;
  }

  if (user && user.isAdmin) {
    // Carregar dados específicos da página
    fetchData();
  }
}, [user, loading, router]);
```

## Gerenciamento de Estado Frontend

### Custom Hooks

#### useUser Hook
```javascript
// frontend/next/src/hooks/useUser.js
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          setUser(decoded);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const sair = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, sair };
}
```

#### fetchWithAuth Utility
```javascript
// frontend/next/src/utils/fetchWithAuth.js
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

## Segurança e Validações

### 1. Validação de Entrada
- Validação de campos obrigatórios
- Verificação de tipos de dados
- Sanitização de inputs
- Validação de tamanhos mínimos/máximos

### 2. Autorização em Camadas
- Middleware de autenticação (JWT)
- Middleware de autorização admin
- Verificação de propriedade de recursos
- Validação de existência de entidades relacionadas

### 3. Proteção de Dados Sensíveis
- Exclusão de senhas nas respostas da API
- Hash automático de senhas
- Tokens de reset com expiração
- Validação de unicidade de usuários

### 4. Tratamento de Erros
- Mensagens de erro padronizadas
- Logs de erro no servidor
- Fallbacks para falhas de rede
- Redirecionamento automático em caso de token inválido

## Funcionalidades de UI/UX

### 1. Interface Responsiva
- Design adaptativo para diferentes tamanhos de tela
- Componentes reutilizáveis
- Animações e transições suaves
- Feedback visual para ações do usuário

### 2. Estados de Loading
- Indicadores de carregamento para operações assíncronas
- Estados de erro com mensagens claras
- Skeleton loaders para melhor UX
- Desabilitação de botões durante operações

### 3. Modais e Formulários
- Modais para criação e edição
- Validação em tempo real
- Confirmações para ações destrutivas
- Formulários com campos condicionais

### 4. Filtros e Busca
- Filtros em cascata (usuário → ciclo → treino)
- Limpeza de filtros
- Estados de loading para filtros
- Interface intuitiva para seleção

## Monitoramento e Logs

### 1. Logs de Operações
- Logs de criação, edição e exclusão
- Rastreamento de usuários administrativos
- Logs de erros com stack traces
- Métricas de uso do sistema

### 2. Estatísticas de Sistema
- Contadores de entidades
- Rankings de usuários ativos
- Métricas de crescimento
- Análise de padrões de uso

## Considerações de Performance

### 1. Otimizações de Banco
- Índices em campos de busca frequente
- População seletiva de campos relacionados
- Agregações otimizadas para estatísticas
- Paginação para listas grandes

### 2. Otimizações Frontend
- Lazy loading de componentes
- Memoização de componentes pesados
- Debounce em filtros
- Cache de dados frequentemente acessados

### 3. Estratégias de Cache
- Cache de estatísticas no frontend
- Invalidação inteligente de cache
- Otimização de requisições repetitivas
- Compressão de respostas da API

## Extensibilidade e Manutenibilidade

### 1. Arquitetura Modular
- Separação clara de responsabilidades
- Controllers focados em lógica específica
- Middleware reutilizável
- Componentes frontend modulares

### 2. Padrões de Código
- Nomenclatura consistente
- Estrutura de pastas organizada
- Documentação inline
- Tratamento de erros padronizado

### 3. Facilidade de Manutenção
- Logs detalhados para debugging
- Validações centralizadas
- Configuração via variáveis de ambiente
- Testes automatizados (recomendado)

## Conclusão

O sistema de administração do Treino Tech oferece uma solução completa e robusta para gerenciamento de usuários, ciclos e treinos. A arquitetura modular, segurança em camadas e interface intuitiva garantem uma experiência eficiente tanto para administradores quanto para usuários finais.

O sistema está preparado para escalabilidade e manutenção, com padrões de código consistentes e funcionalidades bem estruturadas que facilitam futuras expansões e melhorias.
