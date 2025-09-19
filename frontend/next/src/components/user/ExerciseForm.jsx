"use client";

export default function ExerciseForm({
  treinoId,
  novoExercicio,
  setNovoExercicio,
  onAdicionarExercicio,
  onCancelar,
  modoClaro
}) {
  const handleInputChange = (campo, valor) => {
    setNovoExercicio(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className={`p-3 rounded border backdrop-blur-sm mb-4 overflow-visible ${
      modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
    }`}>
      <h4 className={`text-sm font-medium mb-2 ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
        Adicionar Exercício
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <input
          type="text"
          placeholder="Nome do exercício"
          value={novoExercicio.nome || ""}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          className={`border rounded p-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${
            modoClaro
              ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
              : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
          }`}
        />
        
        <input
          type="text"
          placeholder="Séries"
          value={novoExercicio.series || ""}
          onChange={(e) => {
            const valor = e.target.value.replace(/\D/g, "");
            handleInputChange('series', valor);
          }}
          className={`border rounded p-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${
            modoClaro
              ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
              : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
          }`}
        />
        
        <input
          type="text"
          placeholder="Repetições"
          value={novoExercicio.repeticoes || ""}
          onChange={(e) => {
            const valor = e.target.value.replace(/\D/g, "");
            handleInputChange('repeticoes', valor);
          }}
          className={`border rounded p-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${
            modoClaro
              ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
              : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
          }`}
        />
        
        <input
          type="text"
          placeholder="Carga (kg)"
          value={novoExercicio.carga || ""}
          onChange={(e) => {
            const valor = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
            handleInputChange('carga', valor);
          }}
          className={`border rounded p-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${
            modoClaro
              ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
              : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
          }`}
        />
        
        <input
          type="text"
          placeholder="Tempo de descanso"
          value={novoExercicio.tempoDescanso || ""}
          onChange={(e) => handleInputChange('tempoDescanso', e.target.value)}
          className={`border rounded p-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${
            modoClaro
              ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
              : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
          }`}
        />
      </div>
      
      <textarea
        placeholder="Observações (opcional)"
        value={novoExercicio.observacoes || ""}
        onChange={(e) => handleInputChange('observacoes', e.target.value)}
        className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 mb-3 ${
          modoClaro
            ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
        }`}
        rows="2"
      />
      
      {/* Checkbox e input para método de intensificação */}
      <div className="mb-3">
        <label className={`flex items-center gap-2 text-sm ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
          <input
            type="checkbox"
            checked={novoExercicio.metodoIntensificacao !== undefined}
            onChange={(e) => {
              if (e.target.checked) {
                handleInputChange('metodoIntensificacao', '');
              } else {
                handleInputChange('metodoIntensificacao', undefined);
              }
            }}
            className="rounded"
          />
          Método de intensificação
        </label>
        
        {novoExercicio.metodoIntensificacao !== undefined && (
          <input
            type="text"
            placeholder="Ex: Drop set, Bi set, Piramidal..."
            value={novoExercicio.metodoIntensificacao || ""}
            onChange={(e) => handleInputChange('metodoIntensificacao', e.target.value)}
            className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 mt-2 ${
              modoClaro
                ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
            }`}
          />
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onAdicionarExercicio(treinoId)}
          className={`px-3 py-1 text-xs font-medium transition-all duration-300 ${
            modoClaro ? 'text-green-600 hover:text-green-800' : 'text-green-300 hover:text-white'
          }`}
        >
          ✅ Adicionar
        </button>
        <button
          onClick={onCancelar}
          className={`px-3 py-1 text-xs font-medium transition-all duration-300 ${
            modoClaro ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'
          }`}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  );
}
