export default function FixedHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-blue-400/20" style={{ backgroundColor: '#000030' }}>
      <div className="flex items-center justify-center p-3 relative">
        <div className="absolute inset-0 backdrop-blur-sm -mx-[50vw] left-1/2 transform -translate-x-1/2 w-screen" style={{ backgroundColor: '#000030' }}></div>
        <div className="relative z-10">
          <img
            src="/TreinoTech.svg"
            alt="TreinoTech Logo"
            width={175}
            height={70}
            className="object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
