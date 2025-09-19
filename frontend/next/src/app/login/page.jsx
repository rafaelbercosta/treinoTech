'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DynamicBackground from '../../components/DynamicBackground';
import ThemeToggle from '../../components/ThemeToggle';
import useTheme from '../../hooks/useTheme';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setpassword] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();
  const modoClaro = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/user");
      } else {
        setErro(data.message || "Erro ao fazer login");
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-between pt-28 pb-4 relative">
        <DynamicBackground modoClaro={modoClaro} />
        <div className="w-full max-w-md p-8 rounded-lg">
          <h2 className={`text-2xl font-bold text-center mb-6 ${modoClaro ? 'text-gray-900' : 'text-white'}`}>Login</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nome de usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
                modoClaro 
                  ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500' 
                  : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-blue-400'
              }`}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required
              className={`border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
                modoClaro 
                  ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500' 
                  : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-blue-400'
              }`}
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: '#000030' }}
            >
              Entrar
            </button>
            {erro && <p className={`text-center ${modoClaro ? 'text-red-600' : 'text-red-500'}`}>{erro}</p>}
          </form>

          <div className="flex justify-around mt-6">
            <button
              onClick={() => router.push('/register')}
              className={`px-6 py-3 transition-all duration-300 font-medium text-base ${
                modoClaro 
                  ? 'text-blue-600 hover:text-blue-800' 
                  : 'text-blue-300 hover:text-white'
              }`}
            >
              Criar conta
            </button>

            <button
              onClick={() => router.push('/delete-user')}
              className={`px-6 py-3 transition-all duration-300 font-medium text-base ${
                modoClaro 
                  ? 'text-red-600 hover:text-red-800' 
                  : 'text-red-300 hover:text-white'
              }`}
            >
              Excluir conta
            </button>
          </div>
        </div>
        
        {/* Footer HTML no final da página */}
        <footer className={`py-2 text-center border-t ${modoClaro ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-black/20'}`}>
          <p className={`text-xs ${modoClaro ? 'text-gray-500' : 'text-gray-400'}`}>
            Desenvolvido por <span className={`font-medium ${modoClaro ? 'text-gray-700' : 'text-gray-300'}`}>Rafael Costa</span>
          </p>
        </footer>
      </div>
      
      <ThemeToggle />
    </div>
  );
}
