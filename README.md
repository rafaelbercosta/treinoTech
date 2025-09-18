# TreinoTech

Aplicação de gerenciamento de treinos desenvolvida com React, Next.js e Node.js.

## 🚀 Funcionalidades

- **Gerenciamento de Treinos**: Crie, edite e organize seus treinos
- **Exercícios Detalhados**: Séries, repetições, carga e tempo de descanso
- **Métodos de Intensificação**: Drop set, Superset, Rest-pause, etc.
- **Histórico de Treinos**: Acompanhe seu progresso ao longo do tempo
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Modo Claro/Escuro**: Tema adaptável às suas preferências
- **Autenticação Segura**: Sistema de login com JWT
- **Reordenação**: Arraste e solte para reorganizar treinos e exercícios

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca de interface
- **Next.js 14** - Framework React com SSR
- **Tailwind CSS** - Framework de estilos
- **Custom Hooks** - Lógica reutilizável

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação segura

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- MongoDB (local ou Atlas)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/TreinoTech.git
cd TreinoTech
```

### 2. Instale as dependências do backend
```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# IMPORTANTE: Cada desenvolvedor deve criar suas próprias credenciais
```

### 4. Instale as dependências do frontend
```bash
cd ../frontend/next
npm install
```

## 🚀 Executando o Projeto

### Backend
```bash
cd backend
node server.js
```

### Frontend
```bash
cd frontend/next
npm run dev
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Estrutura do Projeto

```
TreinoTech/
├── backend/
│   ├── controllers/     # Lógica de negócio
│   ├── models/         # Modelos do banco de dados
│   ├── routes/         # Rotas da API
│   ├── .env.example    # Template das variáveis de ambiente
│   └── server.js       # Servidor principal
├── frontend/
│   └── next/
│       ├── src/
│       │   ├── app/    # Páginas da aplicação
│       │   ├── components/ # Componentes React
│       │   └── hooks/  # Custom hooks
│       └── public/     # Arquivos estáticos
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

**IMPORTANTE**: O arquivo `.env` não é versionado por segurança. Cada desenvolvedor deve criar o seu próprio.

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:
```env
# Configurações do JWT
JWT_SECRET=sua_chave_secreta_jwt_pessoal
JWT_EXPIRES_IN=1d

# Configurações do MongoDB
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/nome_do_banco?retryWrites=true&w=majority&appName=Cluster0

# Porta do servidor
PORT=5000
```

### Configurando MongoDB

#### Opção 1: MongoDB Atlas (Recomendado)
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster
4. Configure um usuário e senha
5. Obtenha a string de conexão
6. Cole no arquivo `.env`

#### Opção 2: MongoDB Local
1. Instale o MongoDB Community Server
2. Inicie o serviço
3. Use a string: `mongodb://localhost:27017/TreinoTech`

#### Opção 3: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 📱 Funcionalidades Detalhadas

### Treinos
- Criar novos treinos
- Editar treinos existentes
- Excluir treinos
- Reordenar treinos (drag & drop)

### Exercícios
- Adicionar exercícios aos treinos
- Configurar séries, repetições e carga
- Definir tempo de descanso
- Adicionar observações
- Métodos de intensificação
- Reordenar exercícios

### Histórico
- Registrar treinos concluídos
- Visualizar histórico por data
- Estatísticas de progresso

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Rafael Costa**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Rafael Costa](https://linkedin.com/in/rafael-costa)

## 🚀 Deploy na Web

### Opção 1: Vercel (Recomendado)

#### Frontend + Backend no Vercel
1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente**:
   ```
   JWT_SECRET=sua_chave_secreta_jwt
   JWT_EXPIRES_IN=1d
   MONGO_URI=sua_string_mongodb_atlas
   PORT=5000
   ```
3. **Deploy automático**: Vercel detecta Next.js e faz deploy

#### Apenas Frontend no Vercel + Backend no Railway
1. **Frontend (Vercel)**:
   - Conecte o repositório
   - Configure variável: `NEXT_PUBLIC_API_URL=https://seu-backend.railway.app`

2. **Backend (Railway)**:
   - Conecte o repositório
   - Configure variáveis de ambiente
   - Deploy automático

### Opção 2: Netlify + Railway

#### Frontend (Netlify)
1. **Build settings**:
   - Build command: `cd frontend/next && npm run build`
   - Publish directory: `frontend/next/.next`

2. **Variáveis de ambiente**:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
   ```

#### Backend (Railway)
1. **Conecte o repositório**
2. **Configure variáveis**:
   ```
   JWT_SECRET=sua_chave_secreta_jwt
   JWT_EXPIRES_IN=1d
   MONGO_URI=sua_string_mongodb_atlas
   PORT=5000
   ```

### Opção 3: Render (Full-stack)

#### Deploy Completo
1. **Conecte o repositório**
2. **Configure variáveis de ambiente**
3. **Build settings**:
   - Build command: `cd frontend/next && npm run build`
   - Start command: `cd backend && npm start`

## 🔧 Configuração para Deploy

### Variáveis de Ambiente Necessárias

#### Backend
```env
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=1d
MONGO_URI=sua_string_mongodb_atlas
PORT=5000
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### MongoDB Atlas (Obrigatório para Deploy)
1. **Crie uma conta**: [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Cluster gratuito**: 512MB de armazenamento
3. **String de conexão**: Use no deploy
4. **Whitelist IPs**: Adicione `0.0.0.0/0` para permitir qualquer IP

## 📱 URLs de Exemplo

### Deploy Completo
- **Frontend**: https://treinotech.vercel.app
- **Backend**: https://treinotech-api.railway.app

### Apenas Frontend
- **Frontend**: https://treinotech.netlify.app
- **Backend**: https://treinotech-api.railway.app

## 🙏 Agradecimentos

- Comunidade React e Next.js
- Documentação do MongoDB
- Tailwind CSS por facilitar o desenvolvimento
- Vercel, Railway e Netlify por facilitar o deploy

