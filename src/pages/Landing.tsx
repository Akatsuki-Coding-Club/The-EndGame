import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleStartRound = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-1000 scale-110 blur-[1px] opacity-30"
          style={{
            backgroundImage: `url('https://wallpaperaccess.com/full/4908747.jpg')`,
          }}
        />
        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        <div className="absolute inset-0 bg-red-950/10 mix-blend-overlay" />
      </div>

      {/* Main UI Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-6">
        {/* Logo Section */}
        <div className="mb-4">
          <img
            src="https://i.ibb.co/LXwJLXBp/akatsukilogo-removebg-preview.png"
            alt="Akatsuki Logo"
            className="w-[10rem] md:w-[13rem] h-auto object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          />
        </div>

        {/* Header Section */}
        <div className="text-center w-full">
          {/* Akatsuki Presents - Single Line, Letter Spaced */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-white/40" />
            <p className="whitespace-nowrap text-sm md:text-base tracking-[0.6em] md:tracking-[1em] uppercase text-white font-meduim opacity-90">
              Akatsuki Presents
            </p>
            <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-white/40" />
          </div>

          {/* Main Event Text */}

          {/* Subtitle with Skew */}
          {/* Subtitle with Skew and Custom Avengers Font */}
          <div className="inline-block relative">
            {/* Skewed background box */}
            <div className="absolute inset-0 bg-red-600 skew-x-[-15deg] shadow-[0_0_20px_rgba(220,38,38,0.3)]" />

            {/* Added 'font-sans' class here */}
            <h2 className="relative px-10 py-2 text-2xl md:text-4xl font-black tracking-widest uppercase text-white font-sans">
              The Endgame
            </h2>
          </div>
        </div>

        {/* Round Info Card - Improved Glassmorphism with Blur */}
        <div className="mt-12 mb-10 p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl text-center max-w-md shadow-2xl">
          <p className="text-white/80 text-sm md:text-base leading-relaxed tracking-wide">
            The timelines have merged. Your final challenge begins now. Are you
            ready for <span className="text-red-500 ">Round 3</span>?
          </p>
        </div>

        {/* Navigation Button */}
        <button
          onClick={handleStartRound}
          className="relative group overflow-hidden px-14 py-4 rounded-full transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transition-all duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,white_0%,transparent_70%)] transition-opacity duration-300 mix-blend-overlay" />

          <span className="relative z-10 flex items-center gap-3 text-white font-black uppercase tracking-[0.25em] text-sm md:text-base">
            Start Final Round
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Subtle Footer Decor */}


      {/* Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};

export default Landing;
