"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useUser() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState("");

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
    router.push("/login");
  };

  // ===== Carregar nome do usuário =====
  const carregarNomeUsuario = async () => {
    try {
      // Primeiro tenta carregar do localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setNomeUsuario(user.name || "Usuário");
        return;
      }

      // Se não tiver no localStorage, busca da API
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/user", {
        headers: getAuthHeaders(),
      });

      if (verificarTokenExpirado(res)) {
        return;
      }

      if (res.ok) {
        const userData = await res.json();
        setNomeUsuario(userData.name || "Usuário");
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        setNomeUsuario("Usuário");
      }
    } catch (error) {
      console.error("Erro ao carregar nome do usuário:", error);
      setNomeUsuario("Usuário");
    }
  };

  useEffect(() => {
    carregarNomeUsuario();
  }, []);

  return {
    nomeUsuario,
    sair,
    carregarNomeUsuario
  };
}
