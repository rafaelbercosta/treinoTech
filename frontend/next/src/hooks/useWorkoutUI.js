"use client";

import { useState } from "react";

export function useWorkoutUI() {
  // Estados de visibilidade
  const [treinoExpandido, setTreinoExpandido] = useState({});
  const [exFormVisivel, setExFormVisivel] = useState({});
  const [adicionarTreinoVisivel, setAdicionarTreinoVisivel] = useState(false);
  const [historicoVisivel, setHistoricoVisivel] = useState({});
  const [concluirVisivel, setConcluirVisivel] = useState({});
  const [observacaoVisivel, setObservacaoVisivel] = useState({});
  const [menuTreinoVisivel, setMenuTreinoVisivel] = useState({});

  // Estados de edição
  const [editandoEx, setEditandoEx] = useState({});
  const [editandoTreino, setEditandoTreino] = useState({});
  const [editBufferTreino, setEditBufferTreino] = useState({});
  const [exercicioExpandido, setExercicioExpandido] = useState({});

  // Estados de formulários
  const [novoExercicio, setNovoExercicio] = useState({});
  const [novoHistoricoObs, setNovoHistoricoObs] = useState({});

  // Estados de feedback
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupTreino, setSuccessPopupTreino] = useState({});

  // Estados de swipe
  const [swipeStart, setSwipeStart] = useState({});
  const [swipeDirection, setSwipeDirection] = useState({});
  const [swipeActive, setSwipeActive] = useState({});
  const [swipeFeedback, setSwipeFeedback] = useState({});
  const [swipeStartTreino, setSwipeStartTreino] = useState({});
  const [swipeDirectionTreino, setSwipeDirectionTreino] = useState({});
  const [swipeActiveTreino, setSwipeActiveTreino] = useState({});
  const [swipeFeedbackTreino, setSwipeFeedbackTreino] = useState({});
  const [modoSwipeAtivo, setModoSwipeAtivo] = useState(false);

  // Funções de toggle
  const toggleExpandir = (treinoId) => {
    setTreinoExpandido((prev) => {
      const isCurrentlyExpanded = prev[treinoId];
      if (isCurrentlyExpanded) {
        // Se está expandido, apenas fecha este treino
        return { ...prev, [treinoId]: false };
      } else {
        // Se está fechado, fecha todos os outros e abre este
        return { [treinoId]: true };
      }
    });
  };

  const toggleExForm = (treinoId) =>
    setExFormVisivel((prev) => ({ ...prev, [treinoId]: !prev[treinoId] }));

  const toggleEditTreino = (treinoId) =>
    setEditandoTreino((prev) => {
      const next = !prev[treinoId];
      setEditBufferTreino((b) =>
        next
          ? { ...b, [treinoId]: "" }
          : (() => {
              const nb = { ...b };
              delete nb[treinoId];
              return nb;
            })()
      );
      return { ...prev, [treinoId]: next };
    });

  const toggleEditarEx = (exId, treinoId = null) => {
    if (exId === 'fechar-todos') {
      // Fechar edição de todos os exercícios
      setEditandoEx({});
    } else {
      setEditandoEx((prev) => {
        const isCurrentlyEditing = prev[exId];
        if (isCurrentlyEditing) {
          // Se está editando, apenas fecha este exercício
          return { ...prev, [exId]: false };
        } else {
          // Se não está editando, fecha todos os outros e abre este
          const newState = { [exId]: true };
          
          // Se está entrando em modo de edição e temos o treinoId, expandir o treino
          if (treinoId) {
            setTreinoExpandido((prevExpandido) => ({ ...prevExpandido, [treinoId]: true }));
          }
          
          return newState;
        }
      });
    }
  };

  const toggleExpandirExercicio = (exId) => {
    setExercicioExpandido((prev) => {
      const isCurrentlyExpanded = prev[exId];
      if (isCurrentlyExpanded) {
        // Se está expandido, apenas fecha este exercício
        return { ...prev, [exId]: false };
      } else {
        // Se está fechado, fecha todos os outros e abre este
        return { [exId]: true };
      }
    });
  };

  const toggleHistorico = (treinoId) =>
    setHistoricoVisivel((prev) => ({ ...prev, [treinoId]: !prev[treinoId] }));

  const toggleConcluir = (treinoId) =>
    setConcluirVisivel((prev) => ({ ...prev, [treinoId]: !prev[treinoId] }));

  const toggleObservacao = (exId) =>
    setObservacaoVisivel((prev) => ({ ...prev, [exId]: !prev[exId] }));

  const toggleMenuTreino = (treinoId) => {
    setMenuTreinoVisivel((prev) => ({ ...prev, [treinoId]: !prev[treinoId] }));
    if (!treinoExpandido[treinoId]) {
      setTreinoExpandido((prev) => ({ ...prev, [treinoId]: true }));
    }
  };

  const toggleModoSwipe = () => {
    const novoModo = !modoSwipeAtivo;
    setModoSwipeAtivo(novoModo);
    
    // Controlar o scroll do body
    if (typeof window !== 'undefined') {
      if (novoModo) {
        // Salvar a posição atual do scroll
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      } else {
        // Restaurar o scroll
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    }
  };

  // Funções de atualização de campo
  const updateCampoEx = (treinoId, exId, campo, valor) => {
    // Esta função será implementada no componente pai
    // pois precisa acessar o estado dos treinos
    return { treinoId, exId, campo, valor };
  };

  // Funções de swipe para exercícios
  const handleTouchStart = (e, exercicioId, treinoId, exercicioIndex) => {
    if (!modoSwipeAtivo) return;
    e.stopPropagation();
    const touch = e.touches[0];
    setSwipeStart({
      ...swipeStart,
      [exercicioId]: {
        x: touch.clientX,
        y: touch.clientY,
        treinoId,
        exercicioIndex
      }
    });
    setSwipeActive({
      ...swipeActive,
      [exercicioId]: true
    });
  };

  const handleMouseStart = (e, exercicioId, treinoId, exercicioIndex) => {
    if (!modoSwipeAtivo) return;
    e.preventDefault();
    e.stopPropagation();
    setSwipeStart({
      ...swipeStart,
      [exercicioId]: {
        x: e.clientX,
        y: e.clientY,
        treinoId,
        exercicioIndex
      }
    });
    setSwipeActive({
      ...swipeActive,
      [exercicioId]: true
    });
  };

  const handleTouchMove = (e, exercicioId) => {
    if (!swipeStart[exercicioId]) return;
    e.stopPropagation();

    const touch = e.touches[0];
    const start = swipeStart[exercicioId];
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaY) > 20) {
      const direcao = deltaY < 0 ? 'up' : 'down';
      setSwipeFeedback({
        ...swipeFeedback,
        [exercicioId]: {
          direction: direcao,
          intensity: Math.min(Math.abs(deltaY) / 100, 1)
        }
      });
    } else {
      setSwipeFeedback({
        ...swipeFeedback,
        [exercicioId]: null
      });
    }
  };

  const handleMouseMove = (e, exercicioId) => {
    if (!swipeStart[exercicioId]) return;
    e.stopPropagation();

    const start = swipeStart[exercicioId];
    const deltaY = e.clientY - start.y;

    if (Math.abs(deltaY) > 20) {
      const direcao = deltaY < 0 ? 'up' : 'down';
      setSwipeFeedback({
        ...swipeFeedback,
        [exercicioId]: {
          direction: direcao,
          intensity: Math.min(Math.abs(deltaY) / 100, 1)
        }
      });
    } else {
      setSwipeFeedback({
        ...swipeFeedback,
        [exercicioId]: null
      });
    }
  };

  const handleTouchEnd = (e, exercicioId) => {
    if (!swipeStart[exercicioId]) return;
    e.stopPropagation();

    const touch = e.changedTouches[0];
    const start = swipeStart[exercicioId];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    setSwipeStart({
      ...swipeStart,
      [exercicioId]: null
    });
    setSwipeActive({
      ...swipeActive,
      [exercicioId]: false
    });
    setSwipeFeedback({
      ...swipeFeedback,
      [exercicioId]: null
    });

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      const direcao = deltaY < 0 ? 'up' : 'down';
      return { action: 'moveExercise', direction: direcao, start };
    }
    return null;
  };

  const handleMouseEnd = (e, exercicioId) => {
    if (!swipeStart[exercicioId]) return;
    e.stopPropagation();

    const start = swipeStart[exercicioId];
    const deltaX = e.clientX - start.x;
    const deltaY = e.clientY - start.y;

    setSwipeStart({
      ...swipeStart,
      [exercicioId]: null
    });
    setSwipeActive({
      ...swipeActive,
      [exercicioId]: false
    });
    setSwipeFeedback({
      ...swipeFeedback,
      [exercicioId]: null
    });

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      const direcao = deltaY < 0 ? 'up' : 'down';
      return { action: 'moveExercise', direction: direcao, start };
    }
    return null;
  };

  // Funções de swipe para treinos
  const handleTouchStartTreino = (e, treinoId, treinoIndex) => {
    if (!modoSwipeAtivo) return;
    const touch = e.touches[0];
    setSwipeStartTreino({
      ...swipeStartTreino,
      [treinoId]: {
        x: touch.clientX,
        y: touch.clientY,
        treinoIndex: treinoIndex
      }
    });
    setSwipeActiveTreino({
      ...swipeActiveTreino,
      [treinoId]: true
    });
  };

  const handleMouseStartTreino = (e, treinoId, treinoIndex) => {
    if (!modoSwipeAtivo) return;
    e.preventDefault();
    setSwipeStartTreino({
      ...swipeStartTreino,
      [treinoId]: {
        x: e.clientX,
        y: e.clientY,
        treinoIndex: treinoIndex
      }
    });
    setSwipeActiveTreino({
      ...swipeActiveTreino,
      [treinoId]: true
    });
  };

  const handleTouchMoveTreino = (e, treinoId) => {
    if (!swipeStartTreino[treinoId]) return;

    const touch = e.touches[0];
    const start = swipeStartTreino[treinoId];
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaY) > 10) {
      const direction = deltaY > 0 ? 'down' : 'up';
      setSwipeDirectionTreino({
        ...swipeDirectionTreino,
        [treinoId]: direction
      });
      setSwipeFeedbackTreino({
        ...swipeFeedbackTreino,
        [treinoId]: direction
      });
    }
  };

  const handleMouseMoveTreino = (e, treinoId) => {
    if (!swipeStartTreino[treinoId]) return;

    const start = swipeStartTreino[treinoId];
    const deltaY = e.clientY - start.y;

    if (Math.abs(deltaY) > 10) {
      const direction = deltaY > 0 ? 'down' : 'up';
      setSwipeDirectionTreino({
        ...swipeDirectionTreino,
        [treinoId]: direction
      });
      setSwipeFeedbackTreino({
        ...swipeFeedbackTreino,
        [treinoId]: direction
      });
    }
  };

  const handleTouchEndTreino = (e, treinoId) => {
    if (!swipeStartTreino[treinoId]) return;

    const touch = e.changedTouches[0];
    const start = swipeStartTreino[treinoId];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    setSwipeStartTreino({
      ...swipeStartTreino,
      [treinoId]: null
    });
    setSwipeActiveTreino({
      ...swipeActiveTreino,
      [treinoId]: false
    });
    setSwipeDirectionTreino({
      ...swipeDirectionTreino,
      [treinoId]: null
    });
    setSwipeFeedbackTreino({
      ...swipeFeedbackTreino,
      [treinoId]: null
    });

    if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const direction = deltaY > 0 ? 'down' : 'up';
      return { action: 'moveWorkout', direction, start };
    }
    return null;
  };

  const handleMouseEndTreino = (e, treinoId) => {
    if (!swipeStartTreino[treinoId]) return;

    const start = swipeStartTreino[treinoId];
    const deltaX = e.clientX - start.x;
    const deltaY = e.clientY - start.y;

    setSwipeStartTreino({
      ...swipeStartTreino,
      [treinoId]: null
    });
    setSwipeActiveTreino({
      ...swipeActiveTreino,
      [treinoId]: false
    });
    setSwipeDirectionTreino({
      ...swipeDirectionTreino,
      [treinoId]: null
    });
    setSwipeFeedbackTreino({
      ...swipeFeedbackTreino,
      [treinoId]: null
    });

    if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const direction = deltaY > 0 ? 'down' : 'up';
      return { action: 'moveWorkout', direction, start };
    }
    return null;
  };

  return {
    // Estados
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
    novoExercicio,
    setNovoExercicio,
    novoHistoricoObs,
    setNovoHistoricoObs,
    showSuccessPopup,
    successPopupTreino,
    setSuccessPopupTreino,
    swipeStart,
    swipeActive,
    swipeFeedback,
    swipeStartTreino,
    swipeActiveTreino,
    swipeFeedbackTreino,
    modoSwipeAtivo,

    // Setters
    setAdicionarTreinoVisivel,
    setEditBufferTreino,
    setMenuTreinoVisivel,
    setConcluirVisivel,
    setExFormVisivel,
    setHistoricoVisivel,

    // Funções de toggle
    toggleExpandir,
    toggleExForm,
    toggleEditTreino,
    toggleEditarEx,
    toggleHistorico,
    toggleConcluir,
    toggleObservacao,
    toggleMenuTreino,
    toggleModoSwipe,

    // Funções de swipe
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

    // Função de atualização
    updateCampoEx,

    // Estados e funções de expansão de exercícios
    exercicioExpandido,
    toggleExpandirExercicio
  };
}
