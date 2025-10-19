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
              src="/TreinoTech.svg"
              alt="TreinoTech Logo"
              width={175}
              height={70}
              className="object-contain drop-shadow-lg cursor-pointer"
            />
          </Link>
        </div>

        {/* Menu de navegação */}
        <div className="flex items-center space-x-4 relative z-10">
          {!loading && user && (
            <>
              <Link 
                href="/user" 
                className="text-white hover:text-blue-300 transition-colors text-sm font-medium"
              >
                Meus Treinos
              </Link>
              {user.isAdmin && (
                <Link 
                  href="/admin" 
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
