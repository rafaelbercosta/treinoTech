import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const makeUserAdmin = async (userName) => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Encontrar o usuário pelo nome
    const user = await User.findOne({ name: userName });
    
    if (!user) {
      console.log(`❌ Usuário "${userName}" não encontrado`);
      return;
    }

    // Tornar o usuário administrador
    user.isAdmin = true;
    await user.save();

    console.log(`✅ Usuário "${userName}" agora é administrador!`);
    console.log('Você pode fazer login e acessar /admin');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
};

// Substitua 'SEU_NOME_DE_USUARIO' pelo nome do usuário que você quer tornar admin
const userName = process.argv[2] || 'SEU_NOME_DE_USUARIO';

if (userName === 'SEU_NOME_DE_USUARIO') {
  console.log('❌ Por favor, forneça o nome do usuário:');
  console.log('node makeAdmin.js NOME_DO_USUARIO');
  process.exit(1);
}

makeUserAdmin(userName);
