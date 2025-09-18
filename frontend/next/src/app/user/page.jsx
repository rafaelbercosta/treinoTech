"use client";

import { useState, useEffect } from "react";
import DynamicBackground from "../../components/DynamicBackground";
import ThemeToggle from "../../components/ThemeToggle";
import useTheme from "../../hooks/useTheme";
import { useWorkouts } from "../../hooks/useWorkouts";
import { useWorkoutUI } from "../../hooks/useWorkoutUI";
import { useUser } from "../../hooks/useUser";
import UserHeader from "../../components/user/UserHeader";
import AddWorkoutForm from "../../components/user/AddWorkoutForm";
import WorkoutCard from "../../components/user/WorkoutCard";

export default function UserPage() {
  const modoClaro = useTheme();
  const { nomeUsuario, sair } = useUser();
  const {
    treinos,
    setTreinos,
    loading,
    adicionarTreino,
    deletarTreino,
    editarTreino,
    adicionarExercicio,
    deletarExercicio,
    editarExercicio,
    concluirTreino,
    deletarHistorico,
    moverExercicio,
    moverTreino
  } = useWorkouts();
  
  const {
    treinoExpandido,
    exFormVisivel,
    adicionarTreinoVisivel,
    historicoVisivel,
    concluirVisivel,
    observacaoVisivel,
    menuTreinoVisivel,
    editandoEx,
    editandoTreino,
    editBufferTreino,
    exercicioExpandido,
    toggleExpandirExercicio,
    novoExercicio,
    setNovoExercicio,
    novoHistoricoObs,
    setNovoHistoricoObs,
    successPopupTreino,
    setSuccessPopupTreino,
    swipeStart,
    swipeActive,
    swipeFeedback,
    swipeStartTreino,
    swipeActiveTreino,
    swipeFeedbackTreino,
    modoSwipeAtivo,
    setAdicionarTreinoVisivel,
    setEditBufferTreino,
    setMenuTreinoVisivel,
    setConcluirVisivel,
    setExFormVisivel,
    setHistoricoVisivel,
    toggleExpandir,
    toggleExForm,
    toggleEditTreino,
    toggleEditarEx,
    toggleHistorico,
    toggleConcluir,
    toggleObservacao,
    toggleMenuTreino,
    toggleModoSwipe,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseStart,
    handleMouseMove,
    handleMouseEnd,
    handleTouchStartTreino,
    handleTouchMoveTreino,
    handleTouchEndTreino,
    handleMouseStartTreino,
    handleMouseMoveTreino,
    handleMouseEndTreino,
    updateCampoEx
  } = useWorkoutUI();

  const [novoTreinoNome, setNovoTreinoNome] = useState("");

  // ===== Fechar menus ao clicar fora =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.treino-menu-button') && !event.target.closest('.treino-action-buttons') && !event.target.closest('.treino-menu-buttons')) {
        setMenuTreinoVisivel({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ===== Funções de conexão com hooks =====
  const handleAdicionarTreino = async () => {
    const nome = (novoTreinoNome || "").trim();
    if (!nome) return;

    try {
      await adicionarTreino(nome);
      setNovoTreinoNome("");
      setAdicionarTreinoVisivel(false);
    } catch (err) {
      console.error("Erro ao criar treino:", err);
    }
  };

  const handleSalvarEdicaoTreino = async (treinoId) => {
    const novoNome = editBufferTreino[treinoId]?.trim();
    if (!novoNome) return;

    try {
      await editarTreino(treinoId, novoNome);
      setEditBufferTreino((b) => {
        const nb = { ...b };
        delete nb[treinoId];
        return nb;
      });
    } catch (err) {
      console.error("Erro ao editar treino:", err);
    }
  };

  const handleAdicionarExercicio = async (treinoId) => {
    const data = novoExercicio[treinoId] || {};
    const nome = (data.nome || "").trim();
    if (!nome) return;

    try {
      await adicionarExercicio(treinoId, data);
      setNovoExercicio((prev) => ({ ...prev, [treinoId]: {} }));
      // Fechar o formulário após adicionar
      toggleExForm(treinoId);
    } catch (err) {
      console.error("Erro ao adicionar exercício:", err);
    }
  };

  const handleSalvarEdicaoEx = async (treinoId, exId) => {
    const ex = treinos
      .find((t) => t._id === treinoId)
      ?.exercicios.find((e) => e._id === exId);
    if (!ex) return;

    try {
      await editarExercicio(treinoId, exId, ex);
      // Sair do modo de edição após salvar
      toggleEditarEx(exId);
    } catch (err) {
      console.error("Erro ao editar exercício:", err);
    }
  };

  const handleConcluirTreino = async (treinoId) => {
    const obs = novoHistoricoObs[treinoId] || "";

    try {
      await concluirTreino(treinoId, obs);
      setNovoHistoricoObs((prev) => ({ ...prev, [treinoId]: "" }));
      setConcluirVisivel((prev) => ({ ...prev, [treinoId]: false }));
      setSuccessPopupTreino((prev) => ({ ...prev, [treinoId]: true }));
      setTimeout(() => {
        setSuccessPopupTreino((prev) => ({ ...prev, [treinoId]: false }));
      }, 2000);
    } catch (err) {
      console.error("Erro ao registrar treino:", err);
    }
  };

  const handleDeletarTreino = async (treinoId) => {
    if (!window.confirm("Tem certeza que deseja deletar este treino?")) return;

    try {
      await deletarTreino(treinoId);
    } catch (err) {
      console.error("Erro ao remover treino:", err);
    }
  };

  const handleDeletarExercicio = async (treinoId, exId) => {
    if (!window.confirm("Tem certeza que deseja deletar este exercício?")) return;

    try {
      await deletarExercicio(treinoId, exId);
    } catch (err) {
      console.error("Erro ao deletar exercício:", err);
    }
  };

  const handleDeletarHistorico = async (treinoId, histId) => {
    if (!window.confirm("Deseja realmente excluir este registro do histórico?")) return;

    try {
      await deletarHistorico(treinoId, histId);
    } catch (err) {
      console.error("Erro ao deletar histórico:", err);
    }
  };

  // Função para atualizar campos de exercício
  const handleUpdateCampoEx = (treinoId, exId, campo, valor) => {
    // Atualiza o estado dos treinos diretamente
    setTreinos((prev) =>
      prev.map((t) => {
        if (t._id !== treinoId) return t;
        return {
          ...t,
          exercicios: t.exercicios.map((ex) => {
            if (ex._id !== exId) return ex;
            if (["series", "repeticoes"].includes(campo)) {
              const raw = String(valor).replace(/\D/g, "");
              return { ...ex, [campo]: raw === "" ? 0 : parseInt(raw, 10) };
            }
            if (campo === "carga") {
              const raw = String(valor).replace(",", ".").replace(/[^0-9.]/g, "");
              return { ...ex, carga: raw === "" ? 0 : parseFloat(raw) || 0 };
            }
            return { ...ex, [campo]: valor };
          }),
        };
      })
    );
  };

  // Handlers de swipe que conectam com os hooks
  const handleSwipeEnd = (result, exercicioId) => {
    if (result && result.action === 'moveExercise') {
      moverExercicio(result.start.treinoId, result.start.exercicioIndex, result.direction);
    }
  };

  const handleSwipeEndTreino = (result, treinoId) => {
    if (result && result.action === 'moveWorkout') {
      moverTreino(treinoId, result.start.treinoIndex, result.direction);
    }
  };

  // ===== JSX =====
  if (loading) {
    return (
      <div className={`min-h-screen p-6 max-w-6xl mx-auto relative pt-32 ${modoClaro ? 'text-gray-900' : 'text-white'}`}>
        <DynamicBackground modoClaro={modoClaro} />
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${modoClaro ? 'text-gray-600' : 'text-gray-300'}`}>
            Carregando treinos...
          </div>
        </div>
        <ThemeToggle />
      </div>
    );
  }

 return (
  <div className={`min-h-screen p-6 max-w-6xl mx-auto relative pt-32 ${modoClaro ? 'text-gray-900' : 'text-white'}`}>
    <DynamicBackground modoClaro={modoClaro} />

      <UserHeader 
        nomeUsuario={nomeUsuario} 
        onSair={sair} 
        modoClaro={modoClaro} 
      />

    {/* Botão adicionar treino */}
    {!adicionarTreinoVisivel && (
      <div className="flex justify-start items-center mb-4 relative z-10">
        <button
          onClick={() => setAdicionarTreinoVisivel(true)}
          className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
            modoClaro ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-white'
          }`}
        >
          + Adicionar Treino
        </button>
      </div>
    )}

      {/* Formulário de novo treino */}
    {adicionarTreinoVisivel && (
        <AddWorkoutForm
          novoTreinoNome={novoTreinoNome}
          setNovoTreinoNome={setNovoTreinoNome}
          onAdicionarTreino={handleAdicionarTreino}
          onCancelar={() => setAdicionarTreinoVisivel(false)}
          modoClaro={modoClaro}
        />
      )}

      {/* Lista de treinos */}
    <div>
      {treinos && treinos.map((treino, i) => (
          <WorkoutCard
          key={treino._id}
            treino={treino}
            treinoIndex={i}
            treinoExpandido={treinoExpandido}
            editandoTreino={editandoTreino}
            editBufferTreino={editBufferTreino}
            swipeActiveTreino={swipeActiveTreino}
            swipeFeedbackTreino={swipeFeedbackTreino}
            modoSwipeAtivo={modoSwipeAtivo}
            modoClaro={modoClaro}
            onToggleExpandir={toggleExpandir}
            onToggleEditTreino={toggleEditTreino}
            onSalvarEdicaoTreino={handleSalvarEdicaoTreino}
            onSetEditBufferTreino={setEditBufferTreino}
            onToggleMenuTreino={toggleMenuTreino}
            onHandleTouchStartTreino={handleTouchStartTreino}
            onHandleTouchMoveTreino={handleTouchMoveTreino}
            onHandleTouchEndTreino={handleTouchEndTreino}
            onHandleMouseStartTreino={handleMouseStartTreino}
            onHandleMouseMoveTreino={handleMouseMoveTreino}
            onHandleMouseEndTreino={handleMouseEndTreino}
            onSwipeEndTreino={handleSwipeEndTreino}
            onSwipeEnd={handleSwipeEnd}
            onToggleExForm={toggleExForm}
            onAdicionarExercicio={handleAdicionarExercicio}
            onDeletarExercicio={handleDeletarExercicio}
            onToggleEditarEx={toggleEditarEx}
            onUpdateCampoEx={handleUpdateCampoEx}
            onSalvarEdicaoEx={handleSalvarEdicaoEx}
            onMoverExercicio={moverExercicio}
            onToggleHistorico={toggleHistorico}
            onToggleConcluir={toggleConcluir}
            onToggleObservacao={toggleObservacao}
            onConcluirTreino={handleConcluirTreino}
            onDeletarHistorico={handleDeletarHistorico}
            onDeletarTreino={handleDeletarTreino}
            exFormVisivel={exFormVisivel}
            novoExercicio={novoExercicio}
            setNovoExercicio={setNovoExercicio}
            editandoEx={editandoEx}
            observacaoVisivel={observacaoVisivel}
            historicoVisivel={historicoVisivel}
            concluirVisivel={concluirVisivel}
            novoHistoricoObs={novoHistoricoObs}
            setNovoHistoricoObs={setNovoHistoricoObs}
            exercicioExpandido={exercicioExpandido}
            onToggleExpandirExercicio={toggleExpandirExercicio}
            successPopupTreino={successPopupTreino}
            swipeStart={swipeStart}
            swipeActive={swipeActive}
            swipeFeedback={swipeFeedback}
            onHandleTouchStart={handleTouchStart}
            onHandleTouchMove={handleTouchMove}
            onHandleTouchEnd={handleTouchEnd}
            onHandleMouseStart={handleMouseStart}
            onHandleMouseMove={handleMouseMove}
            onHandleMouseEnd={handleMouseEnd}
            menuTreinoVisivel={menuTreinoVisivel}
            setConcluirVisivel={setConcluirVisivel}
            setHistoricoVisivel={setHistoricoVisivel}
            setExFormVisivel={setExFormVisivel}
          />
      ))}
    </div>

    <ThemeToggle />
    
    {/* Botão de modo de movimento fixo no lado esquerdo */}
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={toggleModoSwipe}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 text-2xl md:text-4xl ${
          modoSwipeAtivo
            ? 'text-white hover:opacity-80'
            : modoClaro
              ? 'text-gray-500 hover:text-gray-700'
              : 'text-gray-400 hover:text-gray-200'
        }`}
        style={modoSwipeAtivo ? { backgroundColor: '#000030' } : {}}
        title={modoSwipeAtivo ? "Desativar modo de reordenação" : "Ativar modo de reordenação"}
      >
        ⇅
      </button>
    </div>

  </div>
  );
}
