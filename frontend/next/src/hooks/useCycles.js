"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useCycles() {
  const router = useRouter();
  const [ciclos, setCiclos] = useState([]);
  const [cicloAtivo, setCicloAtivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  const executeWithRetry = async (operationId, operation, maxRetries = 3) => {
    setOperationLoading(prev => ({ ...prev, [operationId]: true }));
    
    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const result = await operation(controller.signal);
          clearTimeout(timeoutId);
          setOperationLoading(prev => ({ ...prev, [operationId]: false }));
          return result;
        } catch (error) {
          if (attempt === maxRetries) {
            setOperationLoading(prev => ({ ...prev, [operationId]: false }));
            alert(`Erro após ${maxRetries} tentativas. O servidor pode estar em modo sleep. Tente novamente em alguns segundos.`);
            throw error;
          }
          
          if (error.name === 'AbortError' || error.message.includes('fetch')) {
            alert(`Tentativa ${attempt}/${maxRetries}: Servidor pode estar iniciando. Aguarde...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          } else {
            setOperationLoading(prev => ({ ...prev, [operationId]: false }));
            throw error;
          }
        }
      }
    } catch (error) {
      setOperationLoading(prev => ({ ...prev, [operationId]: false }));
      throw error;
    }
  };

  // Buscar todos os ciclos
  const buscarCiclos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/cycles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (verificarTokenExpirado(response)) return;

      if (!response.ok) {
        throw new Error('Erro ao buscar ciclos');
      }

      const data = await response.json();
      setCiclos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar ciclo ativo
  const buscarCicloAtivo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/cycles/ativo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (verificarTokenExpirado(response)) return;

      if (!response.ok) {
        throw new Error('Erro ao buscar ciclo ativo');
      }

      const data = await response.json();
      setCicloAtivo(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Criar novo ciclo
  const criarCiclo = async (dadosCiclo) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await executeWithRetry('create-cycle', async (signal) => {
        return await fetch(`${API_URL}/api/cycles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosCiclo),
          signal
        });
      });

      if (verificarTokenExpirado(response)) return;

      if (!response.ok) {
        throw new Error('Erro ao criar ciclo');
      }

      const novoCiclo = await response.json();
      setCiclos(prev => [novoCiclo, ...prev]);
      setCicloAtivo(novoCiclo);
      return novoCiclo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Ativar ciclo
  const ativarCiclo = async (cicloId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await executeWithRetry('activate-cycle', async (signal) => {
        return await fetch(`${API_URL}/api/cycles/${cicloId}/ativar`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal
        });
      });

      if (verificarTokenExpirado(response)) return;

      if (!response.ok) {
        throw new Error('Erro ao ativar ciclo');
      }

      const cicloAtivado = await response.json();
      setCicloAtivo(cicloAtivado);
      
      // Atualizar lista de ciclos
      setCiclos(prev => 
        prev.map(ciclo => ({
          ...ciclo,
          ativo: ciclo._id === cicloId
        }))
      );
      
      return cicloAtivado;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Atualizar ciclo
  const atualizarCiclo = async (cicloId, dadosCiclo) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await executeWithRetry('update-cycle', async (signal) => {
        return await fetch(`${API_URL}/api/cycles/${cicloId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosCiclo),
          signal
        });
      });

      if (verificarTokenExpirado(response)) return;

      if (!response.ok) {
        throw new Error('Erro ao atualizar ciclo');
      }

      const cicloAtualizado = await response.json();
      
      setCiclos(prev => 
        prev.map(ciclo => 
          ciclo._id === cicloId ? cicloAtualizado : ciclo
        )
      );

      if (cicloAtivo?._id === cicloId) {
        setCicloAtivo(cicloAtualizado);
      }

      return cicloAtualizado;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Deletar ciclo
  const deletarCiclo = async (cicloId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await executeWithRetry('delete-cycle', async (signal) => {
        return await fetch(`${API_URL}/api/cycles/${cicloId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal
        });
      });

      if (verificarTokenExpirado(response)) return;

      if (!response.ok) {
        throw new Error('Erro ao deletar ciclo');
      }

      setCiclos(prev => prev.filter(ciclo => ciclo._id !== cicloId));
      
      // Se o ciclo deletado era o ativo, buscar um novo ativo
      if (cicloAtivo?._id === cicloId) {
        await buscarCicloAtivo();
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      await Promise.all([
        buscarCiclos(),
        buscarCicloAtivo()
      ]);
    };

    carregarDados();
  }, []);

  return {
    ciclos,
    cicloAtivo,
    loading,
    error,
    operationLoading,
    buscarCiclos,
    buscarCicloAtivo,
    criarCiclo,
    ativarCiclo,
    atualizarCiclo,
    deletarCiclo
  };
}
