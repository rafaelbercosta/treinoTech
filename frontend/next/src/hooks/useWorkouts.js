"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useWorkouts() {
  const router = useRouter();
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState({});

  // ===== Utilitário Headers =====
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ===== Verificar Token Expirado =====
  const verificarTokenExpirado = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Sessão expirada. Faça login novamente.");
      router.push("/login");
      return true;
    }
    return false;
  };

  // ===== Verificar Token Antes de Operações =====
  const verificarTokenAntesOperacao = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      router.push("/login");
      return false;
    }
    return true;
  };

  // ===== Função Genérica de Retry =====
  const executeWithRetry = async (operationId, fetchFunction, maxRetries = 3) => {
    setOperationLoading(prev => ({ ...prev, [operationId]: true }));
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        const result = await fetchFunction(controller.signal);
        
        clearTimeout(timeoutId);
        setOperationLoading(prev => ({ ...prev, [operationId]: false }));
        return result;
        
      } catch (err) {
        if (err.name === 'AbortError' || err.message.includes('fetch')) {
          // Timeout ou erro de conexão - servidor provavelmente dormindo
          if (attempt < maxRetries - 1) {
            // Mostra alerta informativo
            alert(`🔄 Servidor iniciando... Tentativa ${attempt + 1} de ${maxRetries}\n\nO servidor pode estar em modo sleep. Aguarde alguns segundos.`);
            // Aguarda antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 3000 + (attempt * 2000)));
            continue;
          } else {
            // Última tentativa falhou
            setOperationLoading(prev => ({ ...prev, [operationId]: false }));
            alert("❌ Servidor demorou para responder.\n\nTente novamente em alguns minutos. O servidor pode estar em modo sleep.");
            throw new Error("Servidor demorou para responder. Tente novamente em alguns minutos.");
          }
        } else {
          // Outros erros (não relacionados ao servidor dormindo)
          setOperationLoading(prev => ({ ...prev, [operationId]: false }));
          throw err;
        }
      }
    }
  };

  // ===== Gerenciamento de Ordem dos Exercícios =====
  const salvarOrdemExercicios = (treinoId, exerciciosOrdenados) => {
    try {
      const ordem = exerciciosOrdenados.map(exercicio => exercicio._id);
      const chave = `exercicios_ordem_${treinoId}`;
      localStorage.setItem(chave, JSON.stringify(ordem));
    } catch (error) {
      console.error('Erro ao salvar ordem dos exercícios:', error);
    }
  };

  const carregarOrdemExercicios = (treinoId) => {
    try {
      const chave = `exercicios_ordem_${treinoId}`;
      const ordemSalva = localStorage.getItem(chave);
      return ordemSalva ? JSON.parse(ordemSalva) : null;
    } catch (error) {
      console.error('Erro ao carregar ordem dos exercícios:', error);
      return null;
    }
  };

  const salvarOrdemTreinos = (treinosOrdenados) => {
    try {
      const ordem = treinosOrdenados.map(treino => treino._id);
      localStorage.setItem('treinos_ordem', JSON.stringify(ordem));
    } catch (error) {
      console.error('Erro ao salvar ordem dos treinos:', error);
    }
  };

  const carregarOrdemTreinos = () => {
    try {
      const ordemSalva = localStorage.getItem('treinos_ordem');
      return ordemSalva ? JSON.parse(ordemSalva) : null;
    } catch (error) {
      console.error('Erro ao carregar ordem dos treinos:', error);
      return null;
    }
  };

  const ordenarExerciciosPorOrdemSalva = (treinoId, exercicios) => {
    const ordemSalva = carregarOrdemExercicios(treinoId);
    if (!ordemSalva || ordemSalva.length === 0) return exercicios;

    const exerciciosMap = {};
    exercicios.forEach(exercicio => {
      exerciciosMap[exercicio._id] = exercicio;
    });

    const exerciciosOrdenados = [];
    ordemSalva.forEach(exercicioId => {
      if (exerciciosMap[exercicioId]) {
        exerciciosOrdenados.push(exerciciosMap[exercicioId]);
        delete exerciciosMap[exercicioId];
      }
    });

    Object.values(exerciciosMap).forEach(exercicio => {
      exerciciosOrdenados.push(exercicio);
    });

    return exerciciosOrdenados;
  };

  const ordenarTreinosPorOrdemSalva = (treinos) => {
    const ordemSalva = carregarOrdemTreinos();
    if (!ordemSalva || ordemSalva.length === 0) return treinos;

    const treinosMap = {};
    treinos.forEach(treino => {
      treinosMap[treino._id] = treino;
    });

    const treinosOrdenados = [];
    ordemSalva.forEach(treinoId => {
      if (treinosMap[treinoId]) {
        treinosOrdenados.push(treinosMap[treinoId]);
        delete treinosMap[treinoId];
      }
    });

    Object.values(treinosMap).forEach(treino => {
      treinosOrdenados.push(treino);
    });

    return treinosOrdenados;
  };

  // ===== Buscar treinos =====
  const fetchWorkouts = async () => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts`, {
        headers: getAuthHeaders(),
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      const data = await res.json();
      const treinosOrdenados = ordenarTreinosPorOrdemSalva(data);
      const treinosComExerciciosOrdenados = treinosOrdenados.map(treino => ({
        ...treino,
        exercicios: ordenarExerciciosPorOrdemSalva(treino._id, treino.exercicios || [])
      }));

      setTreinos(treinosComExerciciosOrdenados);
    } catch (err) {
      console.error("Erro ao buscar treinos:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Funções de Treino =====
  const adicionarTreino = async (nome) => {
    if (!verificarTokenAntesOperacao()) return;

    const operationId = `add-workout`;
    
    try {
      const res = await executeWithRetry(operationId, async (signal) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ nome }),
          signal
        });
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      const data = await res.json();
      const novosTreinos = [...treinos, data];
      setTreinos(novosTreinos);
      salvarOrdemTreinos(novosTreinos);
      return data;
    } catch (err) {
      console.error("Erro ao criar treino:", err);
      throw err;
    }
  };

  const deletarTreino = async (treinoId) => {
    if (!verificarTokenAntesOperacao()) return;

    const operationId = `delete-workout-${treinoId}`;
    
    try {
      const res = await executeWithRetry(operationId, async (signal) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          signal
        });
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      const novosTreinos = treinos.filter((t) => t._id !== treinoId);
      setTreinos(novosTreinos);
      salvarOrdemTreinos(novosTreinos);
    } catch (err) {
      console.error("Erro ao remover treino:", err);
      throw err;
    }
  };

  const editarTreino = async (treinoId, novoNome) => {
    if (!verificarTokenAntesOperacao()) return;

    const operationId = `edit-workout-${treinoId}`;
    
    try {
      const res = await executeWithRetry(operationId, async (signal) => {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ nome: novoNome }),
          signal
        });
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const updatedWorkout = await res.json();
      setTreinos((prev) =>
        prev.map((t) => (t._id === treinoId ? updatedWorkout : t))
      );
      return updatedWorkout;
    } catch (err) {
      console.error("Erro ao editar treino:", err);
      throw err;
    }
  };

  // ===== Funções de Exercício =====
  const adicionarExercicio = async (treinoId, dadosExercicio) => {
    if (!verificarTokenAntesOperacao()) return;

    const operationId = `add-exercise-${treinoId}`;
    
    try {
      const res = await executeWithRetry(operationId, async (signal) => {
        return await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}/exercises`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              nome: dadosExercicio.nome,
              series: parseInt(dadosExercicio.series) || 0,
              repeticoes: parseInt(dadosExercicio.repeticoes) || 0,
              carga: parseFloat(dadosExercicio.carga) || 0,
              tempoDescanso: dadosExercicio.tempoDescanso || "",
              observacoes: dadosExercicio.observacoes || "",
              metodoIntensificacao: dadosExercicio.metodoIntensificacao !== undefined ? dadosExercicio.metodoIntensificacao : "",
            }),
            signal
          }
        );
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      const updatedWorkout = await res.json();
      const novosTreinos = treinos.map((t) => (t._id === treinoId ? updatedWorkout : t));
      setTreinos(novosTreinos);
      salvarOrdemExercicios(treinoId, updatedWorkout.exercicios);
      return updatedWorkout;
    } catch (err) {
      console.error("Erro ao adicionar exercício:", err);
      throw err;
    }
  };

  const deletarExercicio = async (treinoId, exId) => {
    if (!verificarTokenAntesOperacao()) return;

    const operationId = `delete-exercise-${treinoId}-${exId}`;
    
    try {
      const res = await executeWithRetry(operationId, async (signal) => {
        return await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}/exercises/${exId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
            signal
          }
        );
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      const updatedWorkout = await res.json();
      const novosTreinos = treinos.map((t) => (t._id === treinoId ? updatedWorkout : t));
      setTreinos(novosTreinos);
      salvarOrdemExercicios(treinoId, updatedWorkout.exercicios);
    } catch (err) {
      console.error("Erro ao deletar exercício:", err);
      throw err;
    }
  };

  const editarExercicio = async (treinoId, exId, dadosExercicio) => {
    if (!verificarTokenAntesOperacao()) return;

    const operationId = `edit-exercise-${treinoId}-${exId}`;
    
    try {
      const res = await executeWithRetry(operationId, async (signal) => {
        return await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}/exercises/${exId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              nome: dadosExercicio.nome,
              series: dadosExercicio.series,
              repeticoes: dadosExercicio.repeticoes,
              carga: dadosExercicio.carga,
              tempoDescanso: dadosExercicio.tempoDescanso,
              observacoes: dadosExercicio.observacoes,
              metodoIntensificacao: dadosExercicio.metodoIntensificacao !== undefined ? dadosExercicio.metodoIntensificacao : "",
            }),
            signal
          }
        );
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      const updatedWorkout = await res.json();
      setTreinos((prev) =>
        prev.map((t) => (t._id === treinoId ? updatedWorkout : t))
      );
      return updatedWorkout;
    } catch (err) {
      console.error("Erro ao editar exercício:", err);
      throw err;
    }
  };

  // ===== Histórico =====
  const concluirTreino = async (treinoId, observacoes) => {
    if (!verificarTokenAntesOperacao()) return;

    try {
      const data = new Date().toISOString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}/history`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ data, observacoes }),
        }
      );

      if (verificarTokenExpirado(res)) {
        return;
      }

      const updatedWorkout = await res.json();
      setTreinos((prev) =>
        prev.map((t) => (t._id === treinoId ? updatedWorkout : t))
      );
      return updatedWorkout;
    } catch (err) {
      console.error("Erro ao registrar treino:", err);
      throw err;
    }
  };

  const deletarHistorico = async (treinoId, histId) => {
    if (!verificarTokenAntesOperacao()) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workouts/${treinoId}/history/${histId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (verificarTokenExpirado(res)) {
        return;
      }

      const updatedWorkout = await res.json();
      setTreinos((prev) =>
        prev.map((t) => (t._id === treinoId ? updatedWorkout : t))
      );
    } catch (err) {
      console.error("Erro ao deletar histórico:", err);
      throw err;
    }
  };

  // ===== Reordenação =====
  const moverExercicio = (treinoId, exercicioIndex, direcao) => {
    const treinosClone = JSON.parse(JSON.stringify(treinos));
    const treino = treinosClone.find((t) => t._id === treinoId);

    if (!treino || !treino.exercicios || treino.exercicios.length <= 1) return;

    const novoIndex = direcao === 'up' ? exercicioIndex - 1 : exercicioIndex + 1;
    if (novoIndex < 0 || novoIndex >= treino.exercicios.length) return;

    const exercicioAtual = treino.exercicios[exercicioIndex];
    const exercicioTroca = treino.exercicios[novoIndex];

    treino.exercicios[exercicioIndex] = exercicioTroca;
    treino.exercicios[novoIndex] = exercicioAtual;

    setTreinos(treinosClone);
    salvarOrdemExercicios(treinoId, treino.exercicios);
  };

  const moverTreino = (treinoId, treinoIndex, direction) => {
    const treino = treinos.find(t => t._id === treinoId);
    if (!treino) return;

    const novoIndex = direction === 'down' ? treinoIndex + 1 : treinoIndex - 1;
    if (novoIndex < 0 || novoIndex >= treinos.length) return;

    const treinosClone = [...treinos];
    const treinoAtual = treinosClone[treinoIndex];
    const treinoTroca = treinosClone[novoIndex];

    treinosClone[treinoIndex] = treinoTroca;
    treinosClone[novoIndex] = treinoAtual;

    setTreinos(treinosClone);
    salvarOrdemTreinos(treinosClone);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return {
    treinos,
    setTreinos,
    loading,
    operationLoading,
    adicionarTreino,
    deletarTreino,
    editarTreino,
    adicionarExercicio,
    deletarExercicio,
    editarExercicio,
    concluirTreino,
    deletarHistorico,
    moverExercicio,
    moverTreino,
    fetchWorkouts
  };
}
