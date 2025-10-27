'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixedHeader from '../../../components/FixedHeader';
import DynamicBackground from '../../../components/DynamicBackground';
import { useUser } from '../../../hooks/useUser';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function AdminUsersPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    if (user && user.isAdmin) {
      fetchUsers();
    }
  }, [user, loading, router]);


  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users`);
      // Ordenar usuários por nome em ordem alfabética
      const sortedUsers = data.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'pt-BR');
      });
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`);
      setSelectedUser(data);
      setShowUserDetails(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      alert('Erro ao buscar detalhes do usuário');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    try {
      // Atualizar dados básicos do usuário
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          isAdmin: editingUser.isAdmin
        })
      });

      // Se uma nova senha foi fornecida, alterar a senha
      if (editingUser.newPassword && editingUser.newPassword.trim() !== '') {
        if (editingUser.newPassword.length < 6) {
          alert('A nova senha deve ter pelo menos 6 caracteres');
          return;
        }

        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users/${editingUser._id}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newPassword: editingUser.newPassword
          })
        });
      }

      await fetchUsers();
      setEditingUser(null);
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`, {
          method: 'DELETE'
        });

        await fetchUsers();
        alert('Usuário deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('Erro ao deletar usuário');
      }
    }
  };

  const toggleDropdown = (userId) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const handleCreateUser = async (userData) => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      await fetchUsers();
      setShowCreateUser(false);
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'));
    }
  };


  if (loading || loadingUsers) {
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
      
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Usuários</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Criar Usuário
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-visible max-w-4xl mx-auto">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Admin</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{user.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isAdmin 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end items-center">
                          <button
                            onClick={() => toggleDropdown(user._id)}
                            className="text-white hover:text-gray-300 text-xl transition-colors p-1"
                            title="Ações"
                          >
                            ⋮
                          </button>
                          
                          {openDropdown === user._id && (
                            <div className="absolute right-8 top-0 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 z-50 p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    fetchUserDetails(user._id);
                                    closeDropdown();
                                  }}
                                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                                  title="Ver detalhes"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={() => {
                                    handleEditUser(user);
                                    closeDropdown();
                                  }}
                                  className="text-yellow-300 hover:text-yellow-200 text-sm transition-colors"
                                  title="Editar usuário"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user._id, user.name);
                                    closeDropdown();
                                  }}
                                  className="text-red-500 hover:text-red-400 text-lg transition-colors font-bold"
                                  title="Excluir usuário"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowUserDetails(false)}
        />
      )}

      {/* Modal de Edição */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => setEditingUser(null)}
          onChange={(field, value) => setEditingUser({ ...editingUser, [field]: value })}
        />
      )}

      {/* Modal de Criação de Usuário */}
      {showCreateUser && (
        <CreateUserModal
          onSave={handleCreateUser}
          onCancel={() => setShowCreateUser(false)}
        />
      )}
    </div>
  );
}

function UserDetailsModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Detalhes do Usuário</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm">Nome</label>
              <div className="text-white">{user.user.name}</div>
            </div>
            <div>
              <label className="text-blue-200 text-sm">Admin</label>
              <div className="text-white">{user.user.isAdmin ? 'Sim' : 'Não'}</div>
            </div>

            <div>
              <label className="text-blue-200 text-sm">Ciclos ({user.cycles.length})</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {user.cycles.map((cycle) => (
                  <div key={cycle._id} className="bg-white/10 rounded p-2">
                    <div className="text-white font-medium">{cycle.nome}</div>
                    <div className="text-blue-200 text-sm">
                      {new Date(cycle.dataInicio).toLocaleDateString()} - {cycle.ativo ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-blue-200 text-sm">Treinos ({user.workouts.length})</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {user.workouts.map((workout) => (
                  <div key={workout._id} className="bg-white/10 rounded p-2">
                    <div className="text-white font-medium">{workout.nome}</div>
                    <div className="text-blue-200 text-sm">
                      {workout.exercicios.length} exercícios
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onSave, onCancel, onChange }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Editar Usuário</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 text-2xl"
              title="Cancelar"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm">Nome</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Nova Senha (opcional)</label>
              <input
                type="password"
                value={user.newPassword || ''}
                onChange={(e) => onChange('newPassword', e.target.value)}
                placeholder="Deixe em branco para manter a senha atual"
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={user.isAdmin}
                onChange={(e) => onChange('isAdmin', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAdmin" className="text-blue-200">Administrador</label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onSave}
              className="text-green-300 hover:text-green-200 transition-colors"
              title="Salvar alterações"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({ onSave, onCancel }) {
  const [userData, setUserData] = useState({
    name: '',
    password: '',
    isAdmin: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações
    if (!userData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    
    if (!userData.password.trim()) {
      alert('Senha é obrigatória');
      return;
    }
    
    if (userData.password.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    onSave(userData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Criar Novo Usuário</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 text-2xl"
              title="Cancelar"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm">Nome do Usuário</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Digite o nome do usuário"
                required
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Senha</label>
              <input
                type="password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Digite a senha (mínimo 6 caracteres)"
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={userData.isAdmin}
                onChange={(e) => setUserData({ ...userData, isAdmin: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAdmin" className="text-blue-200">Administrador</label>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Criar usuário"
              >
                Criar Usuário
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
