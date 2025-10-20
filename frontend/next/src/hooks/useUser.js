"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // ===== Sair =====
  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  // ===== Carregar dados do usuário =====
  const carregarDadosUsuario = async () => {
    try {
      setLoading(true);
      
      // Primeiro tenta carregar do localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log('useUser - Dados do localStorage:', user);
        setUser(user);
        setLoading(false);
        return;
      }

      // Se não tiver no localStorage, busca da API
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user`, {
          headers: getAuthHeaders(),
        });

        if (verificarTokenExpirado(res)) {
          setLoading(false);
          return;
        }

        if (res.ok) {
          const userData = await res.json();
          console.log('useUser - Dados da API:', userData);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.log('useUser - API retornou erro:', res.status);
          setUser(null);
        }
      } catch (error) {
        console.error('useUser - Erro ao conectar com API:', error);
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carregar dados do localStorage imediatamente
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('useUser - Dados do localStorage:', user);
        console.log('useUser - isAdmin do localStorage:', user.isAdmin);
        setUser(user);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Erro ao parsear dados do localStorage:', error);
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }
    }
    
    // Se não tem dados no localStorage, tenta carregar da API
    carregarDadosUsuario();
  }, []);

  return {
    user,
    loading,
    sair,
    carregarDadosUsuario,
    // Manter compatibilidade com código existente
    nomeUsuario: user?.name || "Usuário",
    carregarNomeUsuario: carregarDadosUsuario
  };
}