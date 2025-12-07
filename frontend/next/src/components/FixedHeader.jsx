'use client';

import { useUser } from '../hooks/useUser';
import Link from 'next/link';

export default function FixedHeader() {
  const { user, loading } = useUser();


  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-blue-400/20" style={{ backgroundColor: '#000030' }}>
      <div className="flex items-center justify-between p-3 relative">
        <div className="absolute inset-0 backdrop-blur-sm -mx-[50vw] left-1/2 transform -translate-x-1/2 w-screen" style={{ backgroundColor: '#000030' }}></div>

        {/* Logo centralizado */}
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <img
              src="/TreinoTechFundoTransparente.png"
              alt="TreinoTech Logo"
              width={175}
              height={70}
              className="object-contain drop-shadow-lg cursor-pointer"
            />
          </Link>
        </div>

        {/* Menu de navegação */}
        <div className="flex items-center space-x-4 relative z-10">
          {/* Botão removido - agora está na página de delete-user */}
        </div>
      </div>
    </div>
  );
}
