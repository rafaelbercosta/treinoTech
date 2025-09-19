"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicBackground from "../../components/DynamicBackground";

export default function ForgotPasswordPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Se o nome de usuário estiver cadastrado e tiver email, você receberá instruções em breve.");
        setName("");
      } else {
        setMessage(data.error || "Erro ao enviar email.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro na conexão com o servidor.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 relative">
      <DynamicBackground />
      <div className="w-full max-w-md bg-black/30 backdrop-blur-md p-8 rounded-lg shadow-2xl border border-white/10">
        <h1 className="text-2xl font-bold mb-4 text-white">Esqueci minha senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Digite seu nome de usuário"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-white/20 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Enviar instruções
        </button>

        {message && <p className="text-center mt-2 text-sm text-white">{message}</p>}
      </form>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 text-blue-300 hover:text-blue-100 transition-colors duration-200"
        >
          Voltar para pagina inicial
        </button>
      </div>
    </div>
  );
}
