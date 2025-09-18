"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [modoClaro, setModoClaro] = useState(false);

  // Carregar modo do localStorage
  useEffect(() => {
    try {
      const modoSalvo = localStorage.getItem('modoClaro');
      if (modoSalvo !== null) {
        setModoClaro(JSON.parse(modoSalvo));
      }
    } catch (error) {
      console.error('Erro ao carregar tema do localStorage:', error);
    }
  }, []);

  // Alternância de Modo Claro/Escuro
  const toggleModoClaro = () => {
    const novoModo = !modoClaro;
    setModoClaro(novoModo);
    
    try {
      localStorage.setItem('modoClaro', JSON.stringify(novoModo));
      console.log('Tema salvo no localStorage:', novoModo ? 'claro' : 'escuro');
    } catch (error) {
      console.error('Erro ao salvar tema no localStorage:', error);
    }
    
    // Disparar evento customizado para notificar outras páginas
    window.dispatchEvent(new CustomEvent('modoClaroChanged', { 
      detail: { modoClaro: novoModo } 
    }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleModoClaro}
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 text-2xl md:text-4xl ${
          modoClaro 
            ? 'text-yellow-500 hover:text-yellow-600' 
            : 'text-yellow-400 hover:text-yellow-300'
        }`}
        title={modoClaro ? 'Alternar para modo escuro' : 'Alternar para modo claro'}
      >
        {modoClaro ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
