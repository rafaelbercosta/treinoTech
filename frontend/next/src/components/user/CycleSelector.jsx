"use client";

import { useState, useEffect } from "react";
export default function CycleSelector({ 
  cicloAtivo, 
  onCicloChange, 
  modoClaro,
  ciclos,
  ativarCiclo,
  criarCiclo,
  atualizarCiclo,
  deletarCiclo,
  loading,
  operationLoading = {}
}) {
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoCiclo, setEditandoCiclo] = useState(false);
  const [cicloVisivel, setCicloVisivel] = useState(false);
  const [novoCiclo, setNovoCiclo] = useState({
    nome: "",
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: ""
  });
  const [cicloEditando, setCicloEditando] = useState({
    nome: "",
    dataInicio: "",
    dataFim: ""
  });

  const handleCicloChange = async (cicloId) => {
    try {
      await ativarCiclo(cicloId);
      onCicloChange(cicloId);
      setMostrarDropdown(false);
    } catch (error) {
      console.error("Erro ao trocar ciclo:", error);
    }
  };

  const handleCriarCiclo = async (e) => {
    e.preventDefault();
    try {
      const ciclo = await criarCiclo(novoCiclo);
      onCicloChange(ciclo._id);
      setMostrarFormulario(false);
      setNovoCiclo({ nome: "", dataInicio: new Date().toISOString().split('T')[0], dataFim: "" });
    } catch (error) {
      console.error("Erro ao criar ciclo:", error);
    }
  };

  const handleEditarCiclo = () => {
    if (cicloAtivo) {
      // Converter datas para formato de input (YYYY-MM-DD)
      const dataInicio = new Date(cicloAtivo.dataInicio);
      const dataFim = cicloAtivo.dataFim ? new Date(cicloAtivo.dataFim) : null;
      
      // Usar toLocaleDateString para evitar problemas de fuso horário
      const formatarDataParaInput = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      };
      
      setCicloEditando({
        nome: cicloAtivo.nome,
        dataInicio: formatarDataParaInput(dataInicio),
        dataFim: dataFim ? formatarDataParaInput(dataFim) : ""
      });
      setEditandoCiclo(true);
    }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      if (cicloAtivo && cicloEditando.nome.trim()) {
        await atualizarCiclo(cicloAtivo._id, {
          nome: cicloEditando.nome,
          dataInicio: cicloEditando.dataInicio,
          dataFim: cicloEditando.dataFim || undefined
        });
        setEditandoCiclo(false);
        setCicloEditando({ nome: "", dataInicio: "", dataFim: "" });
      }
    } catch (error) {
      console.error("Erro ao editar ciclo:", error);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoCiclo(false);
    setCicloEditando({ nome: "", dataInicio: "", dataFim: "" });
  };

  const handleExcluirCiclo = async () => {
    if (cicloAtivo && window.confirm(`Tem certeza que deseja excluir o ciclo "${cicloAtivo.nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deletarCiclo(cicloAtivo._id);
        // Fechar a edição após excluir
        setEditandoCiclo(false);
        // O hook já atualiza o estado automaticamente
      } catch (error) {
        console.error("Erro ao excluir ciclo:", error);
        alert("Erro ao excluir ciclo. Verifique se não há treinos associados a este ciclo.");
      }
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarDropdown && !event.target.closest('.ciclo-selector')) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mostrarDropdown]);

  if (loading) {
    return (
      <div className={`p-3 rounded border backdrop-blur-sm mb-4 ${
        modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
      }`}>
        <div className="flex items-center justify-center">
          <div className={`text-sm ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
            Carregando ciclos...
          </div>
        </div>
      </div>
    );
  }

  if (!cicloVisivel) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setCicloVisivel(true)}
          className={`w-1/2 sm:w-1/3 lg:w-1/4 p-2 text-sm font-bold rounded-lg border backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 shadow-md hover:shadow-lg ${
            modoClaro
              ? 'text-blue-800 hover:text-blue-900 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-400 shadow-blue-200'
              : 'text-blue-200 hover:text-white bg-gradient-to-r from-blue-800/40 to-blue-900/40 hover:from-blue-800/60 hover:to-blue-900/60 border-blue-500 shadow-blue-900/50'
          }`}
        >
          {cicloAtivo?.nome || "Nenhum ciclo ativo"}
        </button>
      </div>
    );
  }

  return (
    <div className={`ciclo-selector p-3 rounded border backdrop-blur-sm mb-4 relative transition-all duration-300 ease-in-out ${
      modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
    }`}>
      {/* Botão de ocultar - canto superior direito */}
      <button
        onClick={() => setCicloVisivel(false)}
        className={`absolute -top-2 right-1 p-1 text-2xl font-bold ${
          modoClaro 
            ? 'text-blue-700 hover:text-blue-800' 
            : 'text-blue-300 hover:text-white'
        }`}
        title="Ocultar ciclo"
      >
        −
      </button>
      {/* Header do Ciclo Ativo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
          {editandoCiclo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cicloEditando.nome}
                  onChange={(e) => setCicloEditando(prev => ({ ...prev, nome: e.target.value }))}
                  className={`px-2 py-1 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                    modoClaro
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                  }`}
                  maxLength={28}
                  autoFocus
                />
                <button
                  onClick={handleSalvarEdicao}
                  disabled={operationLoading['update-cycle']}
                  className={`px-3 py-1 text-xs font-medium transition-all duration-300 ease-in-out hover:scale-105 ${
                    operationLoading['update-cycle']
                      ? 'opacity-50 cursor-not-allowed'
                      : modoClaro ? 'text-green-600 hover:text-green-800' : 'text-green-300 hover:text-white'
                  }`}
                >
                  {operationLoading['update-cycle'] ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    '💾 Salvar'
                  )}
                </button>
                <button
                  onClick={handleExcluirCiclo}
                  className={`px-3 py-1 text-xs font-medium transition-all duration-300 ease-in-out hover:scale-105 ${
                    modoClaro ? 'text-red-600 hover:text-red-800' : 'text-red-300 hover:text-white'
                  }`}
                >
                  ✕ Excluir
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={cicloEditando.dataInicio}
                  onChange={(e) => setCicloEditando(prev => ({ ...prev, dataInicio: e.target.value }))}
                  className={`px-2 py-1 text-xs border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                    modoClaro
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                  }`}
                />
                <input
                  type="date"
                  value={cicloEditando.dataFim}
                  onChange={(e) => setCicloEditando(prev => ({ ...prev, dataFim: e.target.value }))}
                  className={`px-2 py-1 text-xs border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                    modoClaro
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                  }`}
                  placeholder="Data de término (opcional)"
                />
              </div>
            </div>
          ) : (
              <span 
                className={`font-semibold cursor-pointer hover:opacity-80 transition-opacity block break-words ${modoClaro ? 'text-blue-700' : 'text-blue-300'}`}
                onClick={handleEditarCiclo}
                title={cicloAtivo?.nome || "Nenhum ciclo ativo"}
              >
                {cicloAtivo?.nome || "Nenhum ciclo ativo"}
              </span>
            )}
          </div>
          
        </div>
      </div>

      {/* Informações do Ciclo */}
      {cicloAtivo && (
        <div className="mt-2 text-xs">
          <div className={`flex items-center gap-4 ${modoClaro ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>🚀 Início: {new Date(cicloAtivo.dataInicio).toLocaleDateString('pt-BR')}</span>
            {cicloAtivo.dataFim && (
              <span>🏁 Término: {new Date(cicloAtivo.dataFim).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className={`flex items-center gap-2 mt-3 transition-all duration-500 ease-in-out ${
        editandoCiclo
          ? 'opacity-0 scale-95 pointer-events-none max-h-0 overflow-hidden'
          : 'opacity-100 scale-100 pointer-events-auto max-h-20'
      }`}>
        <button
          onClick={() => setMostrarDropdown(!mostrarDropdown)}
          className={`px-3 py-1 text-xs font-medium rounded transition-all duration-300 ease-in-out hover:scale-105 ${
            modoClaro 
              ? 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100' 
              : 'text-blue-300 hover:text-white bg-blue-900/30 hover:bg-blue-900/50'
          }`}
        >
          Trocar Ciclo
        </button>
        
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className={`px-3 py-1 text-xs font-medium rounded transition-all duration-300 ease-in-out hover:scale-105 ${
            modoClaro 
              ? 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100' 
              : 'text-green-300 hover:text-white bg-green-900/30 hover:bg-green-900/50'
          }`}
        >
          + Novo Ciclo
        </button>
      </div>

      {/* Dropdown de Ciclos */}
      {mostrarDropdown && (
        <div className={`mt-2 rounded border ${
          modoClaro ? 'bg-white border-gray-300 shadow-lg' : 'bg-gray-900 border-gray-700 shadow-2xl'
        }`}>
          <div className="p-2 max-h-48 overflow-y-auto">
            {ciclos.length === 0 ? (
              <div className={`p-2 text-sm text-center ${modoClaro ? 'text-gray-500' : 'text-gray-400'}`}>
                Nenhum ciclo encontrado
              </div>
            ) : (
              ciclos
                .sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio))
                .map((ciclo) => (
                <button
                  key={ciclo._id}
                  onClick={() => handleCicloChange(ciclo._id)}
                  className={`w-full text-left p-2 rounded transition-all duration-200 ${
                    ciclo.ativo
                      ? modoClaro 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-blue-800 text-blue-100'
                      : modoClaro
                        ? 'hover:bg-gray-100 text-gray-700'
                        : 'hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="font-medium">{ciclo.nome}</div>
                  <div className="text-xs opacity-75">
                    {new Date(ciclo.dataInicio).toLocaleDateString('pt-BR')}
                    {ciclo.ativo && " (Ativo)"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Formulário de Novo Ciclo */}
      <div className={`mt-3 transition-all duration-500 ease-in-out overflow-hidden ${
        mostrarFormulario 
          ? 'opacity-100 max-h-96 transform scale-100' 
          : 'opacity-0 max-h-0 transform scale-95'
      }`}>
        {mostrarFormulario && (
          <div className={`p-3 rounded border ${
            modoClaro ? 'bg-gray-100 border-gray-300' : 'bg-white/10 border-white/20'
          }`}>
          <h4 className={`font-medium mb-3 ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
            Criar Novo Ciclo
          </h4>
          
          <form onSubmit={handleCriarCiclo} className="space-y-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>
                Nome do Ciclo
              </label>
              <input
                type="text"
                value={novoCiclo.nome}
                onChange={(e) => setNovoCiclo(prev => ({ ...prev, nome: e.target.value }))}
                className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  modoClaro
                    ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                }`}
                placeholder="Ex: Ciclo 1 - Janeiro 2024"
                maxLength={28}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>
                Data de Início
              </label>
              <input
                type="date"
                value={novoCiclo.dataInicio}
                onChange={(e) => setNovoCiclo(prev => ({ ...prev, dataInicio: e.target.value }))}
                className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  modoClaro
                    ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                }`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>
                Data de Término (opcional)
              </label>
              <input
                type="date"
                value={novoCiclo.dataFim}
                onChange={(e) => setNovoCiclo(prev => ({ ...prev, dataFim: e.target.value }))}
                className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  modoClaro
                    ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                }`}
              />
            </div>
            
            
            <div className="flex gap-2">
              <button
                type="submit"
                className={`px-3 py-1 text-xs font-medium rounded transition-all duration-300 ease-in-out ${
                  modoClaro 
                    ? 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100' 
                    : 'text-green-300 hover:text-white bg-green-900/30 hover:bg-green-900/50'
                }`}
              >
                ✅ Criar Ciclo
              </button>
              
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all duration-300 ease-in-out ${
                  modoClaro 
                    ? 'text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100' 
                    : 'text-gray-300 hover:text-white bg-gray-900/30 hover:bg-gray-900/50'
                }`}
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
          </div>
        )}
      </div>
    </div>
  );
}
