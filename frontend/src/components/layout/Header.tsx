const Header = () => {
  return (
    <header className="flex items-center h-16 px-6 bg-white border-b border-gray-100 shrink-0">
      {/* 로고 아이콘 (SVG) */}
      <div className="flex items-center justify-center w-8 h-8 mr-3 bg-black rounded-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 font-sans">GuardFilter</h1>
    </header>
  );
};

export default Header;