'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixedHeader from '../../components/FixedHeader';
import DynamicBackground from '../../components/DynamicBackground';
import { useUser } from '../../hooks/useUser';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function AdminPage() {
  const { user, loading, sair } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    if (user && user.isAdmin) {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/stats`);
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <DynamicBackground />
      <FixedHeader />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <h1 className="text-4xl font-bold text-white">
                Painel de Administração
              </h1>
              <button
                onClick={sair}
                className="text-white hover:text-red-300 transition-colors text-lg font-medium px-4 py-2"
              >
                Sair
              </button>
            </div>
            <p className="text-blue-200 text-lg">
              Gerencie usuários, ciclos e treinos do sistema
            </p>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <div className="text-blue-200">Total de Usuários</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">{stats.totalAdmins}</div>
                <div className="text-blue-200">Administradores</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">{stats.totalCycles}</div>
                <div className="text-blue-200">Ciclos Criados</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">{stats.totalWorkouts}</div>
                <div className="text-blue-200">Treinos Criados</div>
              </div>
            </div>
          )}

          {/* Menu de Administração */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="Gerenciar Usuários"
              description="Visualizar, editar e deletar usuários do sistema"
              icon="👥"
              onClick={() => router.push('/admin/users')}
            />
            <AdminCard
              title="Gerenciar Ciclos"
              description="Visualizar e editar ciclos de todos os usuários"
              icon="🔄"
              onClick={() => router.push('/admin/cycles')}
            />
            <AdminCard
              title="Gerenciar Treinos"
              description="Visualizar e editar treinos de todos os usuários"
              icon="💪"
              onClick={() => router.push('/admin/workouts')}
            />
          </div>

          {/* Usuários Mais Ativos */}
          {stats && stats.mostActiveUsers && stats.mostActiveUsers.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Usuários Mais Ativos</h2>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="space-y-3">
                  {stats.mostActiveUsers.map((user, index) => (
                    <div key={user._id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-blue-200 text-sm">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-white font-bold">{user.workoutCount} treinos</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminCard({ title, description, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  );
}
