import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const users = await User.find({}, 'name isAdmin').limit(5);
    console.log('\n📋 Primeiros 5 usuários:');
    users.forEach(user => {
      console.log(`- ${user.name}: isAdmin = ${user.isAdmin}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
};

checkUsers();
