"use client";

export default function ExerciseItem({
  exercicio,
  exercicioIndex,
  treinoId,
  totalExercicios,
  editandoEx,
  observacaoVisivel,
  modoClaro,
  modoSwipeAtivo,
  swipeStart,
  swipeActive,
  swipeFeedback,
  onToggleEditarEx,
  onUpdateCampoEx,
  onSalvarEdicaoEx,
  onDeletarExercicio,
  onToggleObservacao,
  onMoverExercicio,
  onHandleTouchStart,
  onHandleTouchMove,
  onHandleTouchEnd,
  onHandleMouseStart,
  onHandleMouseMove,
  onHandleMouseEnd,
  onSwipeEnd,
  setConcluirVisivel,
  setHistoricoVisivel,
  setExFormVisivel,
  exercicioExpandido,
  onToggleExpandirExercicio
}) {
  // Função para fechar todos os formulários e edições quando editar exercício
  const fecharFormulariosAoEditar = () => {
    setConcluirVisivel((prev) => ({ ...prev, [treinoId]: false }));
    setHistoricoVisivel((prev) => ({ ...prev, [treinoId]: false }));
    setExFormVisivel((prev) => ({ ...prev, [treinoId]: false }));
    // Fechar edição de todos os exercícios do treino
    onToggleEditarEx('fechar-todos');
  };

  return (
    <div
      className={`p-2 rounded border backdrop-blur-sm relative transition-all duration-200 ${
        swipeActive[exercicio._id] ? 'scale-105 shadow-lg' : ''
      } ${
        modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
      } ${
        modoSwipeAtivo ? 'shadow-xl ring-1 ring-blue-400/60' : ''
      } ${
        exercicio.metodoIntensificacao && !editandoEx[exercicio._id] ? 'shadow-md ring-1 ring-orange-400/50 bg-gradient-to-r from-orange-50/20 to-yellow-50/20' : ''
      }`}
      onTouchStart={(e) => onHandleTouchStart(e, exercicio._id, treinoId, exercicioIndex)}
      onTouchMove={(e) => onHandleTouchMove(e, exercicio._id)}
      onTouchEnd={(e) => {
        const result = onHandleTouchEnd(e, exercicio._id);
        if (result) {
          onSwipeEnd(result, exercicio._id);
        }
      }}
      onMouseDown={(e) => onHandleMouseStart(e, exercicio._id, treinoId, exercicioIndex)}
      onMouseMove={(e) => onHandleMouseMove(e, exercicio._id)}
      onMouseUp={(e) => {
        const result = onHandleMouseEnd(e, exercicio._id);
        if (result) {
          onSwipeEnd(result, exercicio._id);
        }
      }}
      onMouseLeave={(e) => {
        const result = onHandleMouseEnd(e, exercicio._id);
        if (result) {
          onSwipeEnd(result, exercicio._id);
        }
      }}
    >

      {/* Tempo de descanso no topo, próximo aos números */}
      {exercicio.tempoDescanso && !editandoEx[exercicio._id] && (
        <div className={`absolute top-2 right-6 text-xs ${
          modoClaro 
            ? 'text-gray-500' 
            : 'text-gray-400'
        }`}>
          {exercicio.tempoDescanso}seg
        </div>
      )}

      {/* Feedback visual do swipe */}
      {swipeActive[exercicio._id] && swipeFeedback[exercicio._id] && (
        <div className={`absolute top-2 right-2 flex flex-col items-center transition-all duration-150 ${
          swipeFeedback[exercicio._id].direction === 'up' ? 'text-green-400' : 'text-orange-400'
        }`}>
          <span className="text-sm font-bold">
            {swipeFeedback[exercicio._id].direction === 'up' ? '↑' : '↓'}
          </span>
          <div 
            className={`w-1 h-4 rounded-full ${
              swipeFeedback[exercicio._id].direction === 'up' ? 'bg-green-400' : 'bg-orange-400'
            }`} 
            style={{ opacity: swipeFeedback[exercicio._id].intensity }}
          ></div>
        </div>
      )}

      {/* Botões de reordenação - aparecem apenas no hover */}
      <div className="flex items-center justify-between mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoverExercicio(treinoId, exercicioIndex, 'up');
            }}
            className={`w-5 h-5 text-xs transition-all duration-300 rounded ${
              exercicioIndex === 0 
                ? 'opacity-30 cursor-not-allowed' 
                : modoClaro 
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
            }`}
            disabled={exercicioIndex === 0}
            title="Mover para cima"
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoverExercicio(treinoId, exercicioIndex, 'down');
            }}
            className={`w-5 h-5 text-xs transition-all duration-300 rounded ${
              exercicioIndex === totalExercicios - 1 
                ? 'opacity-30 cursor-not-allowed' 
                : modoClaro 
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
            }`}
            disabled={exercicioIndex === totalExercicios - 1}
            title="Mover para baixo"
          >
            ↓
          </button>
        </div>
      </div>

      {editandoEx[exercicio._id] ? (
        <div className="space-y-2">
          <input
            type="text"
            value={exercicio.nome}
            onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'nome', e.target.value)}
            maxLength={30}
            className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
              modoClaro
                ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
            }`}
            placeholder="Nome do exercício (máx. 30 caracteres)"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Séries"
              value={exercicio.series}
              onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'series', e.target.value)}
              className={`p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                modoClaro
                  ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                  : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
              }`}
            />
            <input
              type="text"
              placeholder="Repetições"
              value={exercicio.repeticoes}
              onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'repeticoes', e.target.value)}
              className={`p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                modoClaro
                  ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                  : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
              }`}
            />
            <input
              type="text"
              placeholder="Carga"
              value={exercicio.carga}
              onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'carga', e.target.value)}
              className={`p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                modoClaro
                  ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                  : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
              }`}
            />
            <input
              type="text"
              placeholder="Descanso"
              value={exercicio.tempoDescanso}
              onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'tempoDescanso', e.target.value)}
              className={`p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                modoClaro
                  ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                  : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
              }`}
            />
          </div>
          
          <textarea
            placeholder="Observações"
            value={exercicio.observacoes}
            onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'observacoes', e.target.value)}
            className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
              modoClaro
                ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
            }`}
            rows="2"
          />
          
          {/* Campo para método de intensificação */}
          <div>
            <label className={`flex items-center gap-2 text-sm mb-2 ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
              <input
                type="checkbox"
                checked={exercicio.metodoIntensificacao !== undefined}
                onChange={(e) => {
                  if (e.target.checked) {
                    onUpdateCampoEx(treinoId, exercicio._id, 'metodoIntensificacao', '');
                  } else {
                    onUpdateCampoEx(treinoId, exercicio._id, 'metodoIntensificacao', undefined);
                  }
                }}
                className="rounded"
              />
              Método de intensificação
            </label>
            
            {exercicio.metodoIntensificacao !== undefined && (
              <input
                type="text"
                placeholder="Ex: Drop set, Superset, Rest-pause..."
                value={exercicio.metodoIntensificacao || ""}
                onChange={(e) => onUpdateCampoEx(treinoId, exercicio._id, 'metodoIntensificacao', e.target.value)}
                className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  modoClaro
                    ? 'border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500'
                    : 'border-white/20 bg-white/10 text-white focus:ring-blue-400'
                }`}
              />
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onSalvarEdicaoEx(treinoId, exercicio._id)}
              className={`px-3 py-1 text-xs font-medium transition-all duration-300 ${
                modoClaro ? 'text-green-600 hover:text-green-800' : 'text-green-300 hover:text-white'
              }`}
            >
              💾 Salvar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletarExercicio(treinoId, exercicio._id);
              }}
              className={`px-3 py-1 text-xs font-medium transition-all duration-300 ${
                modoClaro ? 'text-red-600 hover:text-red-800' : 'text-red-300 hover:text-white'
              }`}
            >
              ✕ Excluir
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            fecharFormulariosAoEditar();
            onToggleExpandirExercicio(exercicio._id);
          }}
          title={exercicioExpandido[exercicio._id] ? "Clique para minimizar" : "Clique para expandir"}
        >
          {/* Conteúdo minimizado */}
          {!exercicioExpandido[exercicio._id] && (
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 min-w-0 max-w-[60%]">
                <div className="flex items-center gap-2">
                  <h4 
                    className={`font-bold text-sm leading-tight truncate ${modoClaro ? 'text-blue-700' : 'text-blue-300'}`}
                    title={exercicio.nome}
                    style={{ maxWidth: '200px' }}
                  >
                    {exercicio.nome}
                  </h4>
                  {exercicio.metodoIntensificacao && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      modoClaro 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-orange-900/30 text-orange-300'
                    }`}>
                      {exercicio.metodoIntensificacao}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm flex-shrink-0">
                <span className={`font-medium ${modoClaro ? 'text-gray-700' : 'text-gray-200'}`}>
                  {exercicio.series}s
                </span>
                <span className={`font-medium ${modoClaro ? 'text-gray-700' : 'text-gray-200'}`}>
                  {exercicio.repeticoes}r
                </span>
                {exercicio.carga > 0 && (
                  <span className={`font-medium ${modoClaro ? 'text-gray-700' : 'text-gray-200'}`}>
                    {exercicio.carga}kg
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Seção expandida com informações detalhadas */}
          {exercicioExpandido[exercicio._id] && (
            <div className="w-full">
              {/* Nome do exercício expandido */}
              <div className="mb-3">
                <h4 className={`font-bold text-base ${modoClaro ? 'text-blue-700' : 'text-blue-300'}`}>
                  {exercicio.nome}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className={`font-medium ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    Séries:
                  </span>
                  <span className={`ml-1 ${modoClaro ? 'text-gray-800' : 'text-white'}`}>
                    {exercicio.series}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    Repetições:
                  </span>
                  <span className={`ml-1 ${modoClaro ? 'text-gray-800' : 'text-white'}`}>
                    {exercicio.repeticoes}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    Carga:
                  </span>
                  <span className={`ml-1 ${modoClaro ? 'text-gray-800' : 'text-white'}`}>
                    {exercicio.carga}kg
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    Descanso:
                  </span>
                  <span className={`ml-1 ${modoClaro ? 'text-gray-800' : 'text-white'}`}>
                    {exercicio.tempoDescanso}seg
                  </span>
                </div>
              </div>
              
              {/* Método de intensificação */}
              {exercicio.metodoIntensificacao && (
                <div className="mt-3">
                  <span className={`font-medium text-sm ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    Método de intensificação:
                  </span>
                  <span className={`ml-1 text-sm ${modoClaro ? 'text-gray-700' : 'text-gray-200'}`}>
                    {exercicio.metodoIntensificacao}
                  </span>
                </div>
              )}
              
              {/* Observações */}
              {exercicio.observacoes && (
                <div className="mt-3">
                  <span className={`font-medium text-sm ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
                    Observações:
                  </span>
                  <p className={`text-sm mt-1 ${modoClaro ? 'text-gray-700' : 'text-gray-200'}`}>
                    {exercicio.observacoes}
                  </p>
                </div>
              )}
              
              {/* Botão de editar */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleEditarEx(exercicio._id);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all duration-300 border-0 outline-none bg-transparent ${
                    modoClaro
                      ? 'text-gray-600 hover:text-gray-800'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  title="Editar exercício"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex items-center gap-1 ml-2">
            {/* Botões de ação podem ser adicionados aqui no futuro */}
          </div>
        </div>
      )}

      {/* Observações expandidas */}
      {observacaoVisivel[exercicio._id] && (
        <div className={`mt-2 p-2 rounded border ${
          modoClaro ? 'bg-gray-100 border-gray-300' : 'bg-white/10 border-white/20'
        }`}>
          <h5 className={`text-xs font-medium mb-1 ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
            Observações:
          </h5>
          <p className={`text-xs ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
            {exercicio.observacoes || 'Nenhuma observação'}
          </p>
        </div>
      )}
    </div>
  );
}
