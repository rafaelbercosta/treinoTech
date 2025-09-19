"use client";

import ExerciseForm from "./ExerciseForm";
import ExerciseItem from "./ExerciseItem";
import WorkoutHistory from "./WorkoutHistory";

export default function WorkoutCard({
  treino,
  treinoIndex,
  treinoExpandido,
  editandoTreino,
  editBufferTreino,
  swipeActiveTreino,
  swipeFeedbackTreino,
  modoSwipeAtivo,
  modoClaro,
  onToggleExpandir,
  onToggleEditTreino,
  onSalvarEdicaoTreino,
  onSetEditBufferTreino,
  onToggleMenuTreino,
  onHandleTouchStartTreino,
  onHandleTouchMoveTreino,
  onHandleTouchEndTreino,
  onHandleMouseStartTreino,
  onHandleMouseMoveTreino,
  onHandleMouseEndTreino,
  onSwipeEndTreino,
  onSwipeEnd,
  onToggleExForm,
  onAdicionarExercicio,
  onDeletarExercicio,
  onToggleEditarEx,
  onUpdateCampoEx,
  onSalvarEdicaoEx,
  onMoverExercicio,
  onToggleHistorico,
  onToggleConcluir,
  onToggleObservacao,
  onConcluirTreino,
  onDeletarHistorico,
  onDeletarTreino,
  exFormVisivel,
  novoExercicio,
  setNovoExercicio,
  editandoEx,
  observacaoVisivel,
  historicoVisivel,
  concluirVisivel,
  novoHistoricoObs,
  exercicioExpandido,
  onToggleExpandirExercicio,
  setNovoHistoricoObs,
  successPopupTreino,
  swipeStart,
  swipeActive,
  swipeFeedback,
  onHandleTouchStart,
  onHandleTouchMove,
  onHandleTouchEnd,
  onHandleMouseStart,
  onHandleMouseMove,
  onHandleMouseEnd,
  menuTreinoVisivel,
  setConcluirVisivel,
  setHistoricoVisivel,
  setExFormVisivel
}) {
  // Função para fechar todos os formulários exceto o especificado
  const fecharOutrosFormularios = (manterAberto) => {
    if (manterAberto !== 'exForm') {
      setExFormVisivel((prev) => ({ ...prev, [treino._id]: false }));
    }
    if (manterAberto !== 'concluir') {
      setConcluirVisivel((prev) => ({ ...prev, [treino._id]: false }));
    }
    if (manterAberto !== 'historico') {
      setHistoricoVisivel((prev) => ({ ...prev, [treino._id]: false }));
    }
  };

  return (
    <div
      key={treino._id}
      className={`mb-4 rounded border backdrop-blur-sm relative z-10 hover:shadow-lg transition-all duration-300 ${
        modoSwipeAtivo ? 'cursor-move shadow-2xl ring-2 ring-blue-500/50' : 'cursor-default'
      } ${modoClaro ? 'bg-gray-100/90 border-gray-300' : 'bg-black/20 border-white/10'}`}
      onTouchStart={(e) => onHandleTouchStartTreino(e, treino._id, treinoIndex)}
      onTouchMove={(e) => onHandleTouchMoveTreino(e, treino._id)}
      onTouchEnd={(e) => {
        const result = onHandleTouchEndTreino(e, treino._id);
        if (result) {
          onSwipeEndTreino(result, treino._id);
        }
      }}
      onMouseDown={(e) => onHandleMouseStartTreino(e, treino._id, treinoIndex)}
      onMouseMove={(e) => onHandleMouseMoveTreino(e, treino._id)}
      onMouseUp={(e) => {
        const result = onHandleMouseEndTreino(e, treino._id);
        if (result) {
          onSwipeEndTreino(result, treino._id);
        }
      }}
      onMouseLeave={(e) => {
        const result = onHandleMouseEndTreino(e, treino._id);
        if (result) {
          onSwipeEndTreino(result, treino._id);
        }
      }}
    >
      {/* Cabeçalho do treino */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {editandoTreino[treino._id] ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={editBufferTreino[treino._id] ?? treino.nome}
                onChange={(e) =>
                  onSetEditBufferTreino((b) => ({
                    ...b,
                    [treino._id]: e.target.value,
                  }))
                }
                className={`border rounded p-1 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 flex-1 ${
                  modoClaro
                    ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                    : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-blue-400'
                }`}
              />
              <div className="flex gap-1">
                <button
                  onClick={() => onSalvarEdicaoTreino(treino._id)}
                  className="px-2 py-1 text-green-300 hover:text-white text-xs font-medium transition-all duration-300"
                >
                  💾
                </button>
                <button
                  onClick={() => onToggleEditTreino(treino._id)}
                  className="px-2 py-1 text-blue-300 hover:text-white text-sm font-medium transition-all duration-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onToggleExpandir(treino._id)}
              className={`font-semibold text-base transition-all duration-200 hover:scale-105 ${modoClaro ? 'text-gray-900' : 'text-white'}`}
            >
              <span className={`inline-block transition-transform duration-200 ${treinoExpandido[treino._id] ? 'rotate-90' : 'rotate-0'}`}>
                ►
              </span> <strong>{treino.nome}</strong>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {swipeActiveTreino[treino._id] && swipeFeedbackTreino[treino._id] && (
            <div className={`flex flex-col items-center transition-all duration-150 ${
              swipeFeedbackTreino[treino._id] === 'up' ? 'text-green-400' : 'text-orange-400'
            }`}>
              <span className="text-sm font-bold">
                {swipeFeedbackTreino[treino._id] === 'up' ? '↑' : '↓'}
              </span>
              <div className={`w-1 h-4 rounded-full ${
                swipeFeedbackTreino[treino._id] === 'up' ? 'bg-green-400' : 'bg-orange-400'
              }`} style={{ opacity: 0.8 }}></div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenuTreino(treino._id);
            }}
            className={`treino-menu-button w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center hover:scale-110 ${
              modoClaro ? 'bg-gray-300 hover:bg-gray-400' : 'bg-white/20 hover:bg-white/40'
            }`}
          >
            <div className="flex gap-0.5">
              <div className={`w-1 h-1 rounded-full transition-all duration-200 ${modoClaro ? 'bg-gray-800' : 'bg-white'}`}></div>
              <div className={`w-1 h-1 rounded-full transition-all duration-200 ${modoClaro ? 'bg-gray-800' : 'bg-white'}`}></div>
            </div>
          </button>
        </div>
      </div>

      {/* Conteúdo expandido */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          treinoExpandido[treino._id] 
            ? 'max-h-screen opacity-100 transform scale-100' 
            : 'max-h-0 opacity-0 transform scale-95'
        }`}
      >
        <div className="p-4 pt-0">
          {/* Botões de ação - só aparecem quando o menu está visível */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              menuTreinoVisivel[treino._id] 
                ? 'max-h-20 opacity-100 transform scale-100' 
                : 'max-h-0 opacity-0 transform scale-95'
            }`}
          >
            <div className="flex gap-1 sm:gap-2 mb-4">
              <button
                onClick={() => {
                  fecharOutrosFormularios('exForm');
                  onToggleExForm(treino._id);
                }}
                className={`px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  modoClaro ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-base">+</span> Exercício
              </button>
              <button
                onClick={() => {
                  fecharOutrosFormularios('concluir');
                  onToggleConcluir(treino._id);
                }}
                className={`px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  modoClaro ? 'text-green-600 hover:text-green-800' : 'text-green-300 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-base">✅</span> Registrar
              </button>
              <button
                onClick={() => {
                  fecharOutrosFormularios('historico');
                  onToggleHistorico(treino._id);
                }}
                className={`px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  modoClaro ? 'text-purple-600 hover:text-purple-800' : 'text-purple-300 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-base">🕐</span> Histórico
              </button>
              <button
                onClick={() => {
                  fecharOutrosFormularios('none');
                  onDeletarTreino(treino._id);
                }}
                className={`px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  modoClaro ? 'text-red-600 hover:text-red-800' : 'text-red-300 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-base">✕</span> Excluir
              </button>
            </div>
          </div>

          {/* Histórico */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              historicoVisivel[treino._id] 
                ? 'max-h-96 opacity-100 transform scale-100' 
                : 'max-h-0 opacity-0 transform scale-95'
            }`}
          >
            {historicoVisivel[treino._id] && (
              <WorkoutHistory
                treino={treino}
                modoClaro={modoClaro}
                onDeletarHistorico={onDeletarHistorico}
                onFecharHistorico={(treinoId) => setHistoricoVisivel((prev) => ({ ...prev, [treinoId]: false }))}
              />
            )}
          </div>

          {/* Formulário de registrar treino */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              concluirVisivel[treino._id] 
                ? 'max-h-48 opacity-100 transform scale-100' 
                : 'max-h-0 opacity-0 transform scale-95'
            }`}
          >
            {concluirVisivel[treino._id] && (
              <div className={`p-3 rounded border backdrop-blur-sm mb-4 ${
                modoClaro ? 'bg-gray-50 border-gray-300' : 'bg-white/10 border-white/20'
              }`}>
              <h4 className={`text-sm font-medium mb-2 ${modoClaro ? 'text-gray-700' : 'text-white'}`}>
                Registrar Treino
              </h4>
              <textarea
                placeholder="Observações (opcional)"
                value={novoHistoricoObs[treino._id] || ""}
                onChange={(e) => setNovoHistoricoObs(prev => ({ ...prev, [treino._id]: e.target.value }))}
                className={`w-full p-2 text-sm border rounded backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  modoClaro
                    ? 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-green-500'
                    : 'border-white/20 bg-white/10 text-white placeholder-white focus:ring-green-400'
                }`}
                rows="2"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onConcluirTreino(treino._id)}
                  className={`px-3 py-1 text-xs font-medium transition-all duration-300 ${
                    modoClaro ? 'text-green-600 hover:text-green-800' : 'text-green-300 hover:text-white'
                  }`}
                >
                  ✅ Registrar
                </button>
                <button
                  onClick={() => onToggleConcluir(treino._id)}
                  className={`px-3 py-1 text-xs font-medium transition-all duration-300 ${
                    modoClaro ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Formulário de adicionar exercício */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              exFormVisivel[treino._id] 
                ? 'max-h-96 opacity-100 transform scale-100' 
                : 'max-h-0 opacity-0 transform scale-95'
            }`}
          >
            {exFormVisivel[treino._id] && (
              <ExerciseForm
                treinoId={treino._id}
                novoExercicio={novoExercicio[treino._id] || {}}
                setNovoExercicio={(updateFn) => {
                  if (typeof updateFn === 'function') {
                    setNovoExercicio(prev => ({
                      ...prev,
                      [treino._id]: updateFn(prev[treino._id] || {})
                    }));
                  } else {
                    setNovoExercicio(prev => ({ ...prev, [treino._id]: updateFn }));
                  }
                }}
                onAdicionarExercicio={onAdicionarExercicio}
                onCancelar={() => onToggleExForm(treino._id)}
                modoClaro={modoClaro}
              />
            )}
          </div>

          {/* Lista de exercícios */}
          {treino.exercicios && treino.exercicios.length > 0 && (
            <div className="space-y-1 mb-4">
              {treino.exercicios.map((exercicio, exercicioIndex) => (
                <ExerciseItem
                  key={exercicio._id}
                  exercicio={exercicio}
                  exercicioIndex={exercicioIndex}
                  treinoId={treino._id}
                  totalExercicios={treino.exercicios.length}
                  editandoEx={editandoEx}
                  observacaoVisivel={observacaoVisivel}
                  modoClaro={modoClaro}
                  modoSwipeAtivo={modoSwipeAtivo}
                  swipeStart={swipeStart}
                  swipeActive={swipeActive}
                  swipeFeedback={swipeFeedback}
                  onToggleEditarEx={onToggleEditarEx}
                  onUpdateCampoEx={onUpdateCampoEx}
                  onSalvarEdicaoEx={onSalvarEdicaoEx}
                  onDeletarExercicio={onDeletarExercicio}
                  onToggleObservacao={onToggleObservacao}
                  onMoverExercicio={onMoverExercicio}
                  onHandleTouchStart={onHandleTouchStart}
                  onHandleTouchMove={onHandleTouchMove}
                  onHandleTouchEnd={onHandleTouchEnd}
                  onHandleMouseStart={onHandleMouseStart}
                  onHandleMouseMove={onHandleMouseMove}
                  onHandleMouseEnd={onHandleMouseEnd}
                  onSwipeEnd={onSwipeEnd}
                  setConcluirVisivel={setConcluirVisivel}
                  setHistoricoVisivel={setHistoricoVisivel}
                  setExFormVisivel={setExFormVisivel}
                  exercicioExpandido={exercicioExpandido}
                  onToggleExpandirExercicio={onToggleExpandirExercicio}
                />
              ))}
            </div>
          )}


          {/* Popup de sucesso */}
          {successPopupTreino[treino._id] && (
            <div className={`fixed top-4 right-4 p-3 rounded shadow-lg z-50 ${
              modoClaro ? 'bg-green-100 text-green-800' : 'bg-green-900 text-green-200'
            }`}>
              ✅ Treino concluído com sucesso!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
