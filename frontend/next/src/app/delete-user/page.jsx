"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicBackground from "../../components/DynamicBackground";
import ThemeToggle from "../../components/ThemeToggle";
import useTheme from "../../hooks/useTheme";

export default function DeleteUserPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [serverStatus, setServerStatus] = useState(''); // 'sleeping', 'waking', 'online'
  const router = useRouter();
  const modoClaro = useTheme();

  const attemptDelete = async (isRetry = false) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/delete-user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        setServerStatus('online');
        setShowConfirmation(true);
        setMessage("");
        setLoading(false);
      } else {
        setMessage(data.message || "Erro ao verificar credenciais.");
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
            attemptDelete(true);
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
            attemptDelete(true);
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

    if (!name || !password) {
      setMessage("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);
    setRetryCount(0);
    setServerStatus('waking');
    
    await attemptDelete();
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/delete-user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, confirmed: true }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessPopup(true);
        setShowConfirmation(false);
        setName("");
        setPassword("");
        
        // Redirecionar para página inicial após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage(data.message || "Erro ao deletar usuário.");
        setShowConfirmation(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro na conexão com o servidor");
      setShowConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-28 relative">
      <DynamicBackground modoClaro={modoClaro} />
      <div className="w-full max-w-md p-8 rounded-lg">
        {/* Popup de Confirmação */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja deletar o usuário <strong>{name}</strong>?
              </p>
              <p className="text-sm text-red-500 mb-6">
                Esta ação não pode ser desfeita!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sim, Deletar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup de Sucesso */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Usuário Deletado!</h3>
              <p className="text-gray-600 mb-4">Conta removida com sucesso!</p>
              <p className="text-sm text-gray-500">Redirecionando para o login...</p>
            </div>
          </div>
        )}

        <h2 className={`text-2xl font-bold text-center mb-6 ${modoClaro ? 'text-gray-900' : 'text-white'}`}>Deletar Usuário</h2>
        
        <div className={`border rounded p-4 mb-6 ${
          modoClaro 
            ? 'bg-red-100 border-red-300' 
            : 'bg-red-500/20 border-red-400/30'
        }`}>
          <p className={`text-sm ${modoClaro ? 'text-red-800' : 'text-red-200'}`}>
            <strong>Atenção:</strong> Esta ação irá deletar permanentemente sua conta e todos os dados associados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nome de usuário"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
              modoClaro 
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-red-500' 
                : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-red-400'
            }`}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`border rounded p-2 focus:outline-none focus:ring-2 backdrop-blur-sm ${
              modoClaro 
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-red-500' 
                : 'border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-red-400'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg ${
              loading 
                ? 'opacity-70 cursor-not-allowed bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {serverStatus === 'sleeping' && 'Servidor iniciando...'}
                {serverStatus === 'waking' && 'Deletando...'}
                {!serverStatus && 'Verificando...'}
              </div>
            ) : (
              'Verificar e Deletar'
            )}
          </button>
          
          {/* Mensagens de status */}
          {message && (
            <div className={`text-center p-3 rounded-lg ${
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
            <div className={`text-center p-3 rounded-lg ${
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

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className={`px-6 py-3 transition-all duration-300 font-medium text-base ${
              modoClaro 
                ? 'text-blue-600 hover:text-blue-800' 
                : 'text-blue-300 hover:text-white'
            }`}
          >
            Voltar para o login
          </button>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
