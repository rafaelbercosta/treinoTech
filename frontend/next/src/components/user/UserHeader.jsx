"use client";

export default function UserHeader({ nomeUsuario, onSair, modoClaro }) {
  return (
    <div className="mb-4 relative z-10">
      <h2 className={`text-lg font-medium mb-2 ${modoClaro ? 'text-gray-700' : 'text-white/80'}`}>
        Olá, {nomeUsuario || "Usuário"}!
      </h2>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${modoClaro ? 'text-gray-900' : 'text-white'}`}>
          Meus Treinos
        </h1>
        <button
          onClick={onSair}
          className={`px-4 py-2 text-base font-medium transition-all duration-300 ${
            modoClaro ? 'text-red-600 hover:text-red-800' : 'text-red-300 hover:text-white'
          }`}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
