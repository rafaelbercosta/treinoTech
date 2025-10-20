"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useUserDebug() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useUserDebug - useEffect executado');
    
    // Carregar dados do localStorage imediatamente
    const userData = localStorage.getItem("user");
    console.log('useUserDebug - userData do localStorage:', userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('useUserDebug - parsedUser:', parsedUser);
        console.log('useUserDebug - parsedUser.isAdmin:', parsedUser.isAdmin);
        setUser(parsedUser);
        setLoading(false);
        return;
      } catch (error) {
        console.error('useUserDebug - Erro ao parsear:', error);
        localStorage.removeItem("user");
      }
    }
    
    setLoading(false);
  }, []);

  console.log('useUserDebug - Estado atual:', { user, loading });

  return {
    user,
    loading,
    // Manter compatibilidade
    nomeUsuario: user?.name || "Usuário",
    carregarNomeUsuario: () => {},
    carregarDadosUsuario: () => {},
    sair: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    }
  };
}
