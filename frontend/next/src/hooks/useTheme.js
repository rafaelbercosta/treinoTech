"use client";

import { useState, useEffect } from "react";

export default function useTheme() {
  const [modoClaro, setModoClaro] = useState(false);

  useEffect(() => {
    // Carregar modo do localStorage
    try {
      const modoSalvo = localStorage.getItem('modoClaro');
      if (modoSalvo !== null) {
        setModoClaro(JSON.parse(modoSalvo));
        console.log('Tema carregado do localStorage:', JSON.parse(modoSalvo) ? 'claro' : 'escuro');
      }
    } catch (error) {
      console.error('Erro ao carregar tema do localStorage:', error);
    }

    // Escutar mudanças do tema
    const handleThemeChange = (event) => {
      setModoClaro(event.detail.modoClaro);
    };

    window.addEventListener('modoClaroChanged', handleThemeChange);

    return () => {
      window.removeEventListener('modoClaroChanged', handleThemeChange);
    };
  }, []);

  return modoClaro;
}
