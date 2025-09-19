"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicBackground from "../../components/DynamicBackground";
import ThemeToggle from "../../components/ThemeToggle";
import useTheme from "../../hooks/useTheme";

export default function RegisterPage() {
  const [name, setName] = useState("");          // novo estado para nome
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();
  const modoClaro = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar se as senhas correspondem
    if (password !== confirmPassword) {
      setMessage("As senhas não correspondem!");
      return;
    }

    // Validar tamanho mínimo da senha
    if (password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),  // enviar apenas nome e senha
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessPopup(true);
        setName("");
        setPassword("");
        setConfirmPassword("");
        setMessage("");
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage(data.message || "Erro ao cadastrar.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro na conexão com o servidor");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-28 relative">
      <DynamicBackground modoClaro={modoClaro} />
      <div className="w-full max-w-md p-8 rounded-lg">
      {/* Popup de Sucesso */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Cadastro Realizado!</h3>
            <p className="text-gray-600 mb-4">Usuário cadastrado com sucesso!</p>
            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
          </div>
        </div>
      )}
      
      <h1 className={`text-2xl font-bold mb-4 text-center ${modoClaro ? 'text-gray-900' : 'text-white'}`}>Cadastro</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Nome de usuário"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
              modoClaro 
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500' 
                : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-blue-400'
            }`}
            required
          />
        </div>
        {/* <div>
          <input
            type="email"
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2"
          />
        </div> */}
        <div>
          <input
            type="password"
            placeholder="Senha (min 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
              modoClaro 
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500' 
                : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-blue-400'
            }`}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
              modoClaro 
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500' 
                : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-blue-400'
            }`}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ backgroundColor: '#000030' }}
        >
          Cadastrar
        </button>
        {message && <p className={`text-center mt-2 text-sm ${modoClaro ? 'text-red-600' : 'text-white'}`}>{message}</p>}
      </form>
      <button
          onClick={() => router.push('/login')}
          className={`mt-4 px-6 py-3 transition-all duration-300 font-medium text-base text-center w-full ${
            modoClaro 
              ? 'text-blue-600 hover:text-blue-800' 
              : 'text-blue-300 hover:text-white'
          }`}
        >
          Voltar para pagina inicial
        </button>
      </div>
      <ThemeToggle />
    </div>
  );
}
