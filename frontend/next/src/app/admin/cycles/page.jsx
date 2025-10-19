'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixedHeader from '../../../components/FixedHeader';
import DynamicBackground from '../../../components/DynamicBackground';
import { useUser } from '../../../hooks/useUser';
import { fetchWithAuth } from '../../../../utils/fetchWithAuth';

export default function AdminCyclesPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [editingCycle, setEditingCycle] = useState(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    if (user && user.isAdmin) {
      fetchCycles();
    }
  }, [user, loading, router]);

  const fetchCycles = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/cycles');
      if (response.ok) {
        const data = await response.json();
        setCycles(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
    } finally {
      setLoadingCycles(false);
    }
  };

  const handleEditCycle = (cycle) => {
    setEditingCycle({ 
      ...cycle, 
      dataInicio: cycle.dataInicio ? new Date(cycle.dataInicio).toISOString().split('T')[0] : '',
      dataFim: cycle.dataFim ? new Date(cycle.dataFim).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveCycle = async () => {
    try {
      const response = await fetchWithAuth(`/api/admin/cycles/${editingCycle._id}`, {
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

      if (response.ok) {
        await fetchCycles();
        setEditingCycle(null);
        alert('Ciclo atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar ciclo:', error);
      alert('Erro ao atualizar ciclo');
    }
  };

  const handleDeleteCycle = async (cycleId, cycleName) => {
    if (confirm(`Tem certeza que deseja deletar o ciclo "${cycleName}"? Todos os treinos associados também serão deletados.`)) {
      try {
        const response = await fetchWithAuth(`/api/admin/cycles/${cycleId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchCycles();
          alert('Ciclo deletado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao deletar ciclo:', error);
        alert('Erro ao deletar ciclo');
      }
    }
  };

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
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Ciclos</h1>
              <p className="text-blue-200">Visualize e gerencie todos os ciclos do sistema</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Voltar
            </button>
          </div>

          {/* Lista de Ciclos */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Usuário</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Data Início</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Data Fim</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((cycle) => (
                    <tr key={cycle._id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{cycle.nome}</td>
                      <td className="px-6 py-4 text-blue-200">{cycle.usuario?.name || 'Usuário não encontrado'}</td>
                      <td className="px-6 py-4 text-white">
                        {cycle.dataInicio ? new Date(cycle.dataInicio).toLocaleDateString() : 'Não definida'}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {cycle.dataFim ? new Date(cycle.dataFim).toLocaleDateString() : 'Não definida'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cycle.ativo 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {cycle.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCycle(cycle)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCycle(cycle._id, cycle.nome)}
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

      {/* Modal de Edição */}
      {editingCycle && (
        <EditCycleModal
          cycle={editingCycle}
          onSave={handleSaveCycle}
          onCancel={() => setEditingCycle(null)}
          onChange={(field, value) => setEditingCycle({ ...editingCycle, [field]: value })}
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
          <h2 className="text-2xl font-bold text-white mb-6">Editar Ciclo</h2>

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
                value={cycle.dataInicio}
                onChange={(e) => onChange('dataInicio', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Data de Fim</label>
              <input
                type="date"
                value={cycle.dataFim}
                onChange={(e) => onChange('dataFim', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm">Descrição</label>
              <textarea
                value={cycle.descricao || ''}
                onChange={(e) => onChange('descricao', e.target.value)}
                rows={3}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500"
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
