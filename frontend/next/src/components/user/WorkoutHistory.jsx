"use client";

export default function WorkoutHistory({ treino, modoClaro, onDeletarHistorico, onFecharHistorico }) {
  if (!treino.historico || treino.historico.length === 0) {
    return (
      <div className={`p-3 rounded border backdrop-blur-sm ${
        modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`text-sm font-medium ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
            📊 Histórico de Treinos
          </h4>
          <button
            onClick={() => onFecharHistorico(treino._id)}
            className={`px-2 py-1 text-xs font-medium transition-all duration-300 ${
              modoClaro ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'
            }`}
            title="Fechar histórico"
          >
            ✕ Fechar
          </button>
        </div>
        <p className={`text-xs ${modoClaro ? 'text-gray-500' : 'text-gray-400'}`}>
          Nenhum treino concluído ainda.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded border backdrop-blur-sm ${
      modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-medium ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
          📊 Histórico de Treinos ({treino.historico.length})
        </h4>
        <button
          onClick={() => onFecharHistorico(treino._id)}
          className={`px-2 py-1 text-xs font-medium transition-all duration-300 ${
            modoClaro ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'
          }`}
          title="Fechar histórico"
        >
          ✕ Fechar
        </button>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {treino.historico.map((registro, index) => (
          <div
            key={registro._id || index}
            className={`p-2 rounded border ${
              modoClaro ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`text-xs font-medium ${modoClaro ? 'text-gray-800' : 'text-white'}`}>
                  {(() => {
                    const data = new Date(registro.data);
                    if (isNaN(data.getTime())) {
                      return 'Data inválida';
                    }
                    return data.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  })()}
                </div>
                {registro.observacoes && (
                  <div className={`text-xs mt-1 ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    <strong>Obs:</strong> {registro.observacoes}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onDeletarHistorico(treino._id, registro._id)}
                className={`ml-2 px-2 py-1 text-xs transition-all duration-300 ${
                  modoClaro ? 'text-red-600 hover:text-red-800' : 'text-red-300 hover:text-white'
                }`}
                title="Deletar registro"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
