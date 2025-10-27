'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixedHeader from '../../../components/FixedHeader';
import DynamicBackground from '../../../components/DynamicBackground';
import { useUser } from '../../../hooks/useUser';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function AdminWorkoutsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    if (user && user.isAdmin) {
      fetchWorkouts();
      fetchUsers();
    }
  }, [user, loading, router]);


  const fetchWorkouts = async () => {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workouts`);
      setWorkouts(data);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoadingWorkouts(false);
    }
  };

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
    }
  };

  const fetchCycles = async (userId) => {
    if (!userId) {
      setCycles([]);
      return;
    }
    
    setLoadingCycles(true);
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/cycles`);
      // Filtrar ciclos do usuário selecionado
      const userCycles = data.filter(cycle => cycle.usuario._id === userId);
      setCycles(userCycles);
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
      setCycles([]);
    } finally {
      setLoadingCycles(false);
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    // Filtro por usuário
    const matchesUser = !selectedUserId || (workout.userId && workout.userId._id === selectedUserId);
    
    // Filtro por ciclo
    const matchesCycle = !selectedCycleId || (workout.cicloId && workout.cicloId._id === selectedCycleId);
    
    return matchesUser && matchesCycle;
  });

  const handleViewWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetails(true);
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout({ ...workout });
  };

  const handleSaveWorkout = async () => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workouts/${editingWorkout._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editingWorkout.nome,
          exercicios: editingWorkout.exercicios,
          historico: editingWorkout.historico
        })
      });

      await fetchWorkouts();
      setEditingWorkout(null);
      alert('Treino atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      alert('Erro ao atualizar treino');
    }
  };

  const handleDeleteWorkout = async (workoutId, workoutName) => {
    if (confirm(`Tem certeza que deseja deletar o treino "${workoutName}"?`)) {
      try {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workouts/${workoutId}`, {
          method: 'DELETE'
        });

        await fetchWorkouts();
        alert('Treino deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar treino:', error);
        alert('Erro ao deletar treino');
      }
    }
  };

  const handleUserChange = (userId) => {
    setSelectedUserId(userId);
    setSelectedCycleId(''); // Limpar seleção de ciclo quando usuário muda
    fetchCycles(userId);
  };

  const handleCycleChange = (cycleId) => {
    setSelectedCycleId(cycleId);
  };

  const clearFilters = () => {
    setSelectedUserId('');
    setSelectedCycleId('');
    setCycles([]);
  };

  const toggleDropdown = (workoutId) => {
    setOpenDropdown(openDropdown === workoutId ? null : workoutId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const handleCreateWorkout = async (workoutData) => {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });

      await fetchWorkouts();
      setShowCreateWorkout(false);
      alert('Treino criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      alert('Erro ao criar treino');
    }
  };


  if (loading || loadingWorkouts) {
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
              <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Treinos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateWorkout(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Criar Treino
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-white font-semibold">Filtrar por usuário:</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleUserChange(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 min-w-[200px]"
                  >
                    <option value="">Todos os usuários</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id} className="bg-gray-800">
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedUserId && (
                  <div className="flex items-center space-x-4">
                    <label className="text-white font-semibold">Filtrar por ciclo:</label>
                    <select
                      value={selectedCycleId}
                      onChange={(e) => handleCycleChange(e.target.value)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 min-w-[200px]"
                      disabled={loadingCycles}
                    >
                      <option value="">Todos os ciclos</option>
                      {cycles.map((cycle) => (
                        <option key={cycle._id} value={cycle._id} className="bg-gray-800">
                          {cycle.nome} {cycle.ativo ? '(Ativo)' : ''}
                        </option>
                      ))}
                    </select>
                    {loadingCycles && (
                      <div className="text-blue-200 text-sm">Carregando ciclos...</div>
                    )}
                    {!loadingCycles && cycles.length === 0 && (
                      <div className="text-yellow-200 text-sm">Usuário não possui ciclos</div>
                    )}
                  </div>
                )}
                
                {(selectedUserId || selectedCycleId) && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={clearFilters}
                      className="text-red-400 hover:text-red-300 transition-colors text-sm px-3 py-1 border border-red-400/30 rounded-lg hover:bg-red-400/10"
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Treinos */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Usuário</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Ciclo</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Exercícios</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Histórico</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkouts.map((workout) => (
                    <tr key={workout._id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{workout.nome}</td>
                      <td className="px-6 py-4 text-blue-200">{workout.userId?.name || 'Usuário não encontrado'}</td>
                      <td className="px-6 py-4 text-blue-200">{workout.cicloId?.nome || 'Sem ciclo'}</td>
                      <td className="px-6 py-4 text-white">{workout.exercicios?.length || 0}</td>
                      <td className="px-6 py-4 text-white">{workout.historico?.length || 0}</td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end items-center">
                          <button
                            onClick={() => toggleDropdown(workout._id)}
                            className="text-white hover:text-gray-300 text-xl transition-colors p-1"
                            title="Ações"
                          >
                            ⋮
                          </button>
                          
                          {openDropdown === workout._id && (
                            <div className="absolute right-8 top-0 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 z-50 p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    handleViewWorkout(workout);
                                    closeDropdown();
                                  }}
                                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                                  title="Ver detalhes"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={() => {
                                    handleEditWorkout(workout);
                                    closeDropdown();
                                  }}
                                  className="text-yellow-300 hover:text-yellow-200 text-sm transition-colors"
                                  title="Editar treino"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteWorkout(workout._id, workout.nome);
                                    closeDropdown();
                                  }}
                                  className="text-red-500 hover:text-red-400 text-lg transition-colors font-bold"
                                  title="Excluir treino"
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

      {/* Modal de Detalhes do Treino */}
      {showWorkoutDetails && selectedWorkout && (
        <WorkoutDetailsModal
          workout={selectedWorkout}
          onClose={() => setShowWorkoutDetails(false)}
        />
      )}

      {/* Modal de Edição */}
      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onSave={handleSaveWorkout}
          onCancel={() => setEditingWorkout(null)}
          onChange={(field, value) => setEditingWorkout({ ...editingWorkout, [field]: value })}
        />
      )}

      {/* Modal de Criação de Treino */}
      {showCreateWorkout && (
        <CreateWorkoutModal
          users={users}
          onSave={handleCreateWorkout}
          onCancel={() => setShowCreateWorkout(false)}
        />
      )}
    </div>
  );
}

function WorkoutDetailsModal({ workout, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Detalhes do Treino</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-blue-200 text-sm">Nome</label>
                <div className="text-white text-lg font-medium">{workout.nome}</div>
              </div>
              <div>
                <label className="text-blue-200 text-sm">Usuário</label>
                <div className="text-white">{workout.userId?.name || 'Usuário não encontrado'}</div>
              </div>
              <div>
                <label className="text-blue-200 text-sm">Ciclo</label>
                <div className="text-white">{workout.cicloId?.nome || 'Sem ciclo'}</div>
              </div>
              <div>
                <label className="text-blue-200 text-sm">Data de Criação</label>
                <div className="text-white">{new Date(workout.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Exercícios */}
            <div>
              <label className="text-blue-200 text-sm font-medium">Exercícios ({workout.exercicios?.length || 0})</label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {workout.exercicios?.map((exercise, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="text-white font-medium mb-2">{exercise.nome}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-blue-200">Séries:</span>
                        <span className="text-white ml-1">{exercise.series}</span>
                      </div>
                      <div>
                        <span className="text-blue-200">Repetições:</span>
                        <span className="text-white ml-1">{exercise.repeticoes}</span>
                      </div>
                      <div>
                        <span className="text-blue-200">Carga:</span>
                        <span className="text-white ml-1">{exercise.carga || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-blue-200">Descanso:</span>
                        <span className="text-white ml-1">{exercise.tempoDescanso || 'N/A'}</span>
                      </div>
                    </div>
                    {exercise.observacoes && (
                      <div className="mt-2">
                        <span className="text-blue-200 text-sm">Observações:</span>
                        <div className="text-white text-sm">{exercise.observacoes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico */}
            <div>
              <label className="text-blue-200 text-sm font-medium">Histórico ({workout.historico?.length || 0})</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {workout.historico?.map((entry, index) => (
                  <div key={index} className="bg-white/10 rounded p-3">
                    <div className="text-white font-medium">
                      {new Date(entry.data).toLocaleDateString()}
                    </div>
                    {entry.observacoes && (
                      <div className="text-blue-200 text-sm mt-1">{entry.observacoes}</div>
                    )}
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

function EditWorkoutModal({ workout, onSave, onCancel, onChange }) {
  const [exercicios, setExercicios] = useState(workout.exercicios || []);
  const [historico, setHistorico] = useState(workout.historico || []);

  const addExercise = () => {
    setExercicios([...exercicios, {
      nome: '',
      series: 0,
      repeticoes: 0,
      carga: '',
      tempoDescanso: '',
      observacoes: '',
      metodoIntensificacao: ''
    }]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercicios];
    updated[index][field] = value;
    setExercicios(updated);
  };

  const removeExercise = (index) => {
    setExercicios(exercicios.filter((_, i) => i !== index));
  };

  const addHistoryEntry = () => {
    setHistorico([...historico, {
      data: new Date().toISOString().split('T')[0],
      observacoes: ''
    }]);
  };

  const updateHistoryEntry = (index, field, value) => {
    const updated = [...historico];
    updated[index][field] = value;
    setHistorico(updated);
  };

  const removeHistoryEntry = (index) => {
    setHistorico(historico.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onChange('exercicios', exercicios);
    onChange('historico', historico);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Editar Treino</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 text-2xl"
              title="Cancelar"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-blue-200 text-sm">Nome do Treino</label>
              <input
                type="text"
                value={workout.nome}
                onChange={(e) => onChange('nome', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Exercícios */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-blue-200 text-sm font-medium">Exercícios</label>
            <button
              onClick={addExercise}
              className="text-green-300 hover:text-green-200 text-sm transition-colors"
              title="Adicionar exercício"
            >
              ➕
            </button>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {exercicios.map((exercise, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">Exercício {index + 1}</span>
                      <button
                        onClick={() => removeExercise(index)}
                        className="text-red-500 hover:text-red-400 text-lg transition-colors font-bold"
                        title="Excluir exercício"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-blue-200 text-xs">Nome</label>
                        <input
                          type="text"
                          value={exercise.nome}
                          onChange={(e) => updateExercise(index, 'nome', e.target.value)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200 text-xs">Séries</label>
                        <input
                          type="number"
                          value={exercise.series}
                          onChange={(e) => updateExercise(index, 'series', parseInt(e.target.value) || 0)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200 text-xs">Repetições</label>
                        <input
                          type="number"
                          value={exercise.repeticoes}
                          onChange={(e) => updateExercise(index, 'repeticoes', parseInt(e.target.value) || 0)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200 text-xs">Carga</label>
                        <input
                          type="text"
                          value={exercise.carga}
                          onChange={(e) => updateExercise(index, 'carga', e.target.value)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200 text-xs">Tempo de Descanso</label>
                        <input
                          type="text"
                          value={exercise.tempoDescanso}
                          onChange={(e) => updateExercise(index, 'tempoDescanso', e.target.value)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200 text-xs">Método de Intensificação</label>
                        <input
                          type="text"
                          value={exercise.metodoIntensificacao}
                          onChange={(e) => updateExercise(index, 'metodoIntensificacao', e.target.value)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-blue-200 text-xs">Observações</label>
                      <textarea
                        value={exercise.observacoes}
                        onChange={(e) => updateExercise(index, 'observacoes', e.target.value)}
                        rows={2}
                        className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-blue-200 text-sm font-medium">Histórico</label>
            <button
              onClick={addHistoryEntry}
              className="text-green-300 hover:text-green-200 text-sm transition-colors"
              title="Adicionar entrada no histórico"
            >
              ➕
            </button>
              </div>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {historico.map((entry, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Entrada {index + 1}</span>
                      <button
                        onClick={() => removeHistoryEntry(index)}
                        className="text-red-500 hover:text-red-400 text-lg transition-colors font-bold"
                        title="Excluir entrada do histórico"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-blue-200 text-xs">Data</label>
                        <input
                          type="date"
                          value={entry.data}
                          onChange={(e) => updateHistoryEntry(index, 'data', e.target.value)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200 text-xs">Observações</label>
                        <input
                          type="text"
                          value={entry.observacoes}
                          onChange={(e) => updateHistoryEntry(index, 'observacoes', e.target.value)}
                          className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
        <button
          onClick={handleSave}
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
function CreateWorkoutModal({ users, onSave, onCancel }) {
  const [workoutData, setWorkoutData] = useState({
    nome: '',
    userId: '',
    cicloId: ''
  });
  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);

  // Buscar ciclos quando um usuário é selecionado
  const fetchCycles = async (userId) => {
    if (!userId) {
      setCycles([]);
      return;
    }
    
    setLoadingCycles(true);
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/cycles`);
      // Filtrar ciclos do usuário selecionado
      const userCycles = data.filter(cycle => cycle.usuario._id === userId);
      setCycles(userCycles);
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
      setCycles([]);
    } finally {
      setLoadingCycles(false);
    }
  };

  const handleUserChange = (userId) => {
    setWorkoutData({ ...workoutData, userId, cicloId: '' });
    fetchCycles(userId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workoutData.nome || !workoutData.userId) {
      alert('Nome e usuário são obrigatórios');
      return;
    }
    onSave(workoutData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Criar Novo Treino</h2>
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
              <label className="text-blue-200 text-sm">Nome do Treino</label>
              <input
                type="text"
                value={workoutData.nome}
                onChange={(e) => setWorkoutData({ ...workoutData, nome: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Usuário</label>
              <select
                value={workoutData.userId}
                onChange={(e) => handleUserChange(e.target.value)}
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
              <label className="text-blue-200 text-sm">Ciclo (opcional)</label>
              <select
                value={workoutData.cicloId}
                onChange={(e) => setWorkoutData({ ...workoutData, cicloId: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                disabled={loadingCycles || !workoutData.userId}
              >
                <option value="">Selecione um ciclo</option>
                {cycles.map((cycle) => (
                  <option key={cycle._id} value={cycle._id} className="bg-gray-800">
                    {cycle.nome} {cycle.ativo ? '(Ativo)' : ''}
                  </option>
                ))}
              </select>
              {loadingCycles && (
                <div className="text-blue-200 text-xs mt-1">Carregando ciclos...</div>
              )}
              {!loadingCycles && workoutData.userId && cycles.length === 0 && (
                <div className="text-yellow-200 text-xs mt-1">Usuário não possui ciclos</div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="text-green-300 hover:text-green-200 transition-colors"
                title="Criar treino"
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
  