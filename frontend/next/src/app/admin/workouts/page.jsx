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

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    if (user && user.isAdmin) {
      fetchWorkouts();
    }
  }, [user, loading, router]);

  const fetchWorkouts = async () => {
    try {
      console.log('🚀 Iniciando busca de treinos...');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workouts`;
      console.log('🚀 URL:', url);
      const data = await fetchWithAuth(url);
      console.log('🚀 Dados recebidos:', data);
      setWorkouts(data);
    } catch (error) {
      console.error('❌ Erro ao buscar treinos:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoadingWorkouts(false);
    }
  };

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

      if (response.ok) {
        await fetchWorkouts();
        setEditingWorkout(null);
        alert('Treino atualizado com sucesso!');
      }
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
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Treinos</h1>
              <p className="text-blue-200">Visualize e gerencie todos os treinos do sistema</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Voltar
            </button>
          </div>

          {/* Lista de Treinos */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Usuário</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Ciclo</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Exercícios</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Histórico</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map((workout) => (
                    <tr key={workout._id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{workout.nome}</td>
                      <td className="px-6 py-4 text-blue-200">{workout.userId?.name || 'Usuário não encontrado'}</td>
                      <td className="px-6 py-4 text-blue-200">{workout.cicloId?.nome || 'Sem ciclo'}</td>
                      <td className="px-6 py-4 text-white">{workout.exercicios?.length || 0}</td>
                      <td className="px-6 py-4 text-white">{workout.historico?.length || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewWorkout(workout)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleEditWorkout(workout)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteWorkout(workout._id, workout.nome)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Deletar
                          </button>
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
          <h2 className="text-2xl font-bold text-white mb-6">Editar Treino</h2>

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
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Adicionar Exercício
                </button>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {exercicios.map((exercise, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">Exercício {index + 1}</span>
                      <button
                        onClick={() => removeExercise(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                      >
                        Remover
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
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Adicionar Entrada
                </button>
              </div>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {historico.map((entry, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Entrada {index + 1}</span>
                      <button
                        onClick={() => removeHistoryEntry(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                      >
                        Remover
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
