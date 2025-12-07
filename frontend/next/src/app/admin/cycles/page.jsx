'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixedHeader from '../../../components/FixedHeader';
import DynamicBackground from '../../../components/DynamicBackground';
import { useUser } from '../../../hooks/useUser';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function AdminCyclesPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [editingCycle, setEditingCycle] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycleWorkouts, setCycleWorkouts] = useState([]);
  const [showCycleWorkouts, setShowCycleWorkouts] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [showCreateCycle, setShowCreateCycle] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }
    if (user && user.isAdmin) {
      fetchCycles();
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchCycles = async () => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/cycles`);
      // Ordenar ciclos por nome do usuário em ordem alfabética
      const sortedCycles = data.sort((a, b) => {
        const nameA = a.usuario?.name || '';
        const nameB = b.usuario?.name || '';
        return nameA.localeCompare(nameB);
      });
      setCycles(sortedCycles);
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoadingCycles(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users`);
      // Ordenar usuários por nome em ordem alfabética
      const sortedUsers = data.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchCycleWorkouts = async (cycleId) => {
    try {
      setLoadingWorkouts(true);
      // Filtrar treinos que pertencem ao ciclo específico
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workouts`);
      const cycleWorkouts = data.filter(workout => workout.cicloId && workout.cicloId._id === cycleId);
      setCycleWorkouts(cycleWorkouts);
    } catch (error) {
      console.error('Erro ao buscar treinos do ciclo:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const handleEditCycle = (cycle) => {
    setEditingCycle({ ...cycle });
  };

  const handleSaveCycle = async () => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/cycles/${editingCycle._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editingCycle.nome,
          dataInicio: editingCycle.dataInicio,
          dataFim: editingCycle.dataFim,
          descricao: editingCycle.descricao,
          ativo: editingCycle.ativo
        })
      });

      await fetchCycles();
      setEditingCycle(null);
      alert('Ciclo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ciclo:', error);
      alert('Erro ao atualizar ciclo');
    }
  };

  const handleDeleteCycle = async (cycleId, cycleName) => {
    if (confirm(`Tem certeza que deseja deletar o ciclo "${cycleName}"? Todos os treinos associados também serão deletados.`)) {
      try {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/cycles/${cycleId}`, {
          method: 'DELETE'
        });

        await fetchCycles();
        alert('Ciclo deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar ciclo:', error);
        alert('Erro ao deletar ciclo');
      }
    }
  };

  const handleCreateCycle = async (cycleData) => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/cycles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cycleData)
      });

      await fetchCycles();
      setShowCreateCycle(false);
      alert('Ciclo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      alert('Erro ao criar ciclo');
    }
  };

  const handleViewCycleWorkouts = async (cycle) => {
    setSelectedCycle(cycle);
    setShowCycleWorkouts(true);
    await fetchCycleWorkouts(cycle._id);
  };

  const toggleDropdown = (cycleId) => {
    setOpenDropdown(openDropdown === cycleId ? null : cycleId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const filteredCycles = selectedUserId
    ? cycles.filter(cycle => cycle.usuario && cycle.usuario._id === selectedUserId)
    : cycles;

  if (loading || loadingCycles) {
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
              <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Ciclos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateCycle(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Criar Ciclo
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>

          {/* Filtro por Usuário */}
          <div className="mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
              <div className="flex items-center space-x-4">
                <label className="text-white font-semibold">Filtrar por usuário:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Todos os usuários</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Ciclos */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Usuário</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Data Início</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Data Fim</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCycles.map((cycle) => (
                    <tr key={cycle._id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{cycle.nome}</td>
                      <td className="px-6 py-4 text-blue-200">{cycle.usuario?.name || 'Usuário não encontrado'}</td>
                      <td className="px-6 py-4 text-blue-200">
                        {cycle.dataInicio ? new Date(cycle.dataInicio).toLocaleDateString() : 'Não definida'}
                      </td>
                      <td className="px-6 py-4 text-blue-200">
                        {cycle.dataFim ? new Date(cycle.dataFim).toLocaleDateString() : 'Não definida'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cycle.ativo
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                          {cycle.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end items-center">
                          <button
                            onClick={() => toggleDropdown(cycle._id)}
                            className="text-white hover:text-gray-300 text-xl transition-colors p-1"
                            title="Ações"
                          >
                            ⋮
                          </button>

                          {openDropdown === cycle._id && (
                            <div className="absolute right-8 top-0 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 z-50 p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    handleViewCycleWorkouts(cycle);
                                    closeDropdown();
                                  }}
                                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                                  title="Ver treinos"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={() => {
                                    handleEditCycle(cycle);
                                    closeDropdown();
                                  }}
                                  className="text-yellow-300 hover:text-yellow-200 text-sm transition-colors"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCycle(cycle._id, cycle.nome);
                                    closeDropdown();
                                  }}
                                  className="text-red-300 hover:text-red-200 text-sm transition-colors"
                                  title="Excluir"
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

      {/* Modal de Edição */}
      {editingCycle && (
        <EditCycleModal
          cycle={editingCycle}
          onSave={handleSaveCycle}
          onCancel={() => setEditingCycle(null)}
          onChange={(field, value) => setEditingCycle({ ...editingCycle, [field]: value })}
        />
      )}

      {/* Modal de Treinos do Ciclo */}
      {showCycleWorkouts && (
        <CycleWorkoutsModal
          cycle={selectedCycle}
          workouts={cycleWorkouts}
          loading={loadingWorkouts}
          onClose={() => setShowCycleWorkouts(false)}
        />
      )}

      {/* Modal de Criação de Ciclo */}
      {showCreateCycle && (
        <CreateCycleModal
          users={users}
          onSave={handleCreateCycle}
          onCancel={() => setShowCreateCycle(false)}
        />
      )}
    </div>
  );
}

function EditCycleModal({ cycle, onSave, onCancel, onChange }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Editar Ciclo</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 text-2xl"
              title="Cancelar"
            >
              x
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm">Nome</label>
              <input
                type="text"
                value={cycle.nome}
                onChange={(e) => onChange('nome', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Data de Início</label>
              <input
                type="date"
                value={cycle.dataInicio ? new Date(cycle.dataInicio).toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('dataInicio', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Data de Fim</label>
              <input
                type="date"
                value={cycle.dataFim ? new Date(cycle.dataFim).toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('dataFim', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Descrição</label>
              <textarea
                value={cycle.descricao || ''}
                onChange={(e) => onChange('descricao', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={cycle.ativo}
                onChange={(e) => onChange('ativo', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
              />
              <label htmlFor="ativo" className="text-blue-200">Ciclo Ativo</label>
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

function CycleWorkoutsModal({ cycle, workouts, loading, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Treinos do Ciclo: {cycle?.nome}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
              title="Fechar"
            >
              x
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-white">Carregando treinos...</div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white">Nenhum treino encontrado para este ciclo.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div key={workout._id} className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-2">{workout.nome}</h3>
                  <p className="text-blue-200 text-sm mb-1">
                    Usuário: {workout.userId?.name || 'Usuário não encontrado'}
                  </p>
                  <p className="text-blue-200 text-sm mb-3">
                    Exercícios: {workout.exercicios?.length || 0}
                  </p>

                  {workout.exercicios && workout.exercicios.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-white mb-2">Exercícios:</h4>
                      <div className="space-y-2">
                        {workout.exercicios.map((exercise, index) => (
                          <div key={index} className="bg-white/5 rounded p-2">
                            <div className="text-sm text-white font-medium">{exercise.nome}</div>
                            <div className="text-xs text-gray-300">
                              {exercise.series} séries x {exercise.repeticoes} reps
                              {exercise.carga > 0 && ' @ ' + exercise.carga + 'kg'}
                              {exercise.tempoDescanso && ' | Descanso: ' + exercise.tempoDescanso}
                            </div>
                            {exercise.observacoes && (
                              <div className="text-xs text-gray-400 mt-1">{exercise.observacoes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {workout.historico && workout.historico.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-white mb-2">Histórico:</h4>
                      <div className="space-y-1">
                        {workout.historico.map((entry, index) => (
                          <div key={index} className="text-xs text-gray-300">
                            <span className="text-blue-200">{entry.data}:</span> {entry.observacoes}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateCycleModal({ users, onSave, onCancel }) {
  const [cycleData, setCycleData] = useState({
    nome: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    descricao: '',
    usuario: '',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cycleData.nome || !cycleData.usuario) {
      alert('Nome e usuário são obrigatórios');
      return;
    }
    onSave(cycleData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Criar Novo Ciclo</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 text-2xl"
              title="Cancelar"
            >
              x
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm">Nome do Ciclo</label>
              <input
                type="text"
                value={cycleData.nome}
                onChange={(e) => setCycleData({ ...cycleData, nome: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Usuário</label>
              <select
                value={cycleData.usuario}
                onChange={(e) => setCycleData({ ...cycleData, usuario: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-blue-200 text-sm">Data de Início</label>
              <input
                type="date"
                value={cycleData.dataInicio}
                onChange={(e) => setCycleData({ ...cycleData, dataInicio: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Data de Fim (opcional)</label>
              <input
                type="date"
                value={cycleData.dataFim}
                onChange={(e) => setCycleData({ ...cycleData, dataFim: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Descrição (opcional)</label>
              <textarea
                value={cycleData.descricao}
                onChange={(e) => setCycleData({ ...cycleData, descricao: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={cycleData.ativo}
                onChange={(e) => setCycleData({ ...cycleData, ativo: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
              />
              <label htmlFor="ativo" className="text-blue-200">Ciclo Ativo</label>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="text-green-300 hover:text-green-200 transition-colors"
                title="Criar ciclo"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}