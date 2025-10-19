import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const addIsAdminField = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Atualizar todos os usuários que não têm o campo isAdmin
    const result = await User.updateMany(
      { isAdmin: { $exists: false } },
      { $set: { isAdmin: false } }
    );

    console.log(`✅ Campo isAdmin adicionado para ${result.modifiedCount} usuários`);
    console.log('Todos os usuários agora têm isAdmin: false (usuários normais)');
    
    // Mostrar quantos usuários existem
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const normalUsers = await User.countDocuments({ isAdmin: false });
    
    console.log('\n📊 Estatísticas:');
    console.log(`Total de usuários: ${totalUsers}`);
    console.log(`Administradores: ${adminUsers}`);
    console.log(`Usuários normais: ${normalUsers}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
};

addIsAdminField();
