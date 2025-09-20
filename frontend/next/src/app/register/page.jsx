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
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [serverStatus, setServerStatus] = useState(''); // 'sleeping', 'waking', 'online'
  const router = useRouter();
  const modoClaro = useTheme();

  const attemptRegister = async (isRetry = false) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),  // enviar apenas nome e senha
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        setServerStatus('online');
        setShowSuccessPopup(true);
        setName("");
        setPassword("");
        setConfirmPassword("");
        setMessage("");
        setLoading(false);
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage(data.message || "Erro ao cadastrar.");
        setLoading(false);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Timeout - servidor provavelmente dormindo
        setServerStatus('sleeping');
        setMessage("Servidor iniciando, aguarde...");
        
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            setServerStatus('waking');
            attemptRegister(true);
          }, 5000); // Tenta novamente em 5 segundos
        } else {
          setMessage("Servidor demorou para responder. Tente novamente em alguns minutos.");
          setLoading(false);
        }
      } else {
        // Outros erros de conexão
        setServerStatus('sleeping');
        setMessage("Erro de conexão. Servidor pode estar iniciando...");
        
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            setServerStatus('waking');
            attemptRegister(true);
          }, 3000);
        } else {
          setMessage("Não foi possível conectar ao servidor. Tente novamente.");
          setLoading(false);
        }
      }
    }
  };

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

    setLoading(true);
    setRetryCount(0);
    setServerStatus('waking');
    
    await attemptRegister();
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
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg ${
            loading 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
          style={{ backgroundColor: '#000030' }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {serverStatus === 'sleeping' && 'Servidor iniciando...'}
              {serverStatus === 'waking' && 'Cadastrando...'}
              {!serverStatus && 'Criando conta...'}
            </div>
          ) : (
            'Cadastrar'
          )}
        </button>
        
        {/* Mensagens de status */}
        {message && (
          <div className={`text-center p-3 rounded-lg mt-2 ${
            modoClaro 
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
              : 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-300'
          }`}>
            <p className="text-sm">{message}</p>
            {retryCount > 0 && (
              <p className="text-xs mt-1 opacity-75">
                Tentativa {retryCount}/3
              </p>
            )}
          </div>
        )}
        
        {serverStatus === 'sleeping' && (
          <div className={`text-center p-3 rounded-lg mt-2 ${
            modoClaro 
              ? 'bg-blue-50 border border-blue-200 text-blue-800' 
              : 'bg-blue-900/20 border border-blue-500/30 text-blue-300'
          }`}>
            <p className="text-sm">🔄 Servidor está iniciando...</p>
            <p className="text-xs mt-1 opacity-75">
              Isso pode levar até 60 segundos
            </p>
          </div>
        )}
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
