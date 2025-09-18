"use client";

export default function AddWorkoutForm({ 
  novoTreinoNome, 
  setNovoTreinoNome, 
  onAdicionarTreino, 
  onCancelar, 
  modoClaro 
}) {
  return (
    <div className={`p-3 rounded border backdrop-blur-sm mb-4 ${
      modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
    }`}>
      <h4 className={`text-sm font-medium mb-2 ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
        Adicionar Treino
      </h4>
      
      <input
        type="text"
        placeholder="Nome do treino"
        value={novoTreinoNome}
        onChange={(e) => setNovoTreinoNome(e.target.value)}
        className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 mb-3 ${
          modoClaro
            ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
        }`}
      />
      
      <div className="flex gap-2">
        <button
          onClick={onAdicionarTreino}
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
