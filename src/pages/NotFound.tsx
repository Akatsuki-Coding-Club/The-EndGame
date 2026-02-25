import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508] text-white relative overflow-hidden selection:bg-red-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_60%)]" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      <div className="text-center relative z-10 p-8 border border-red-500/10 bg-black/40 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.05)]">
        <h1 className="mb-2 text-7xl md:text-8xl font-black tracking-[0.1em] text-red-500/90 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">
          404
        </h1>
        <p className="mb-8 text-[11px] md:text-xs font-mono text-red-500/60 tracking-[0.3em] uppercase">
          [ ERROR : SECTOR_NOT_FOUND_IN_TIMELINE ]
        </p>

        <Link
          to="/"
          className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs text-red-500 border border-red-500/30 rounded hover:bg-red-500/10 transition-all uppercase group"
        >
          <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">Return to Base</span>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
