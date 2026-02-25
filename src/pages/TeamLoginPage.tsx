import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
// Added Loader2 to the imports
import { ShieldAlert, Lock, User, Terminal, Loader2 } from "lucide-react";

const TeamLoginPage = () => {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState("");

  // 1. Defined the missing isLoading state
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const CUSTOM_SOUND_PATH = "/alert.mp3";

  const backgroundOptions = [
    "https://i.ibb.co/0p6SgpVW/44aa5903-5c27-4602-ad23-0ec051b8276a.jpg",
    "https://wallpapercave.com/wp/wp4892697.jpg",
    "https://wallpapercave.com/wp/wp5498157.jpg",
    "https://i.ibb.co/ZRfNDzrp/0b879b21-1833-41ef-b4d6-19729f5697a3.jpg",
  ];

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * backgroundOptions.length);
    const selectedBg = backgroundOptions[randomIdx];
    setBgImageUrl(selectedBg);

    // SAVE TO LOCALSTORAGE HERE
    localStorage.setItem("team_session_bg", selectedBg);

    audioRef.current = new Audio(CUSTOM_SOUND_PATH);
    audioRef.current.volume = 1.0;
    audioRef.current.preload = "auto";

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Removed security alert logic
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        })
        .catch(() => { });
    }

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  };

  // 2. Updated handleSubmit to manage isLoading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true); // Start "Verifying..." state

    try {
      const ok = await login(teamId, password);
      if (ok) {
        navigate("/rules", { replace: true });
      } else {
        setError("ACCESS DENIED: INVALID CREDENTIALS");
      }
    } catch (err) {
      setError("SYSTEM ERROR: UNABLE TO CONNECT");
    } finally {
      setIsLoading(false); // Stop "Verifying..." state regardless of result
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505] font-sans"
      onClick={enterFullscreen}
    >
      {/* Optimized Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center transition-all duration-1000 scale-105 opacity-40 blur-[0.5px]"
          style={{ backgroundImage: `url('${bgImageUrl}')` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.9)_100%)]" />
        <div className="absolute inset-0 bg-red-950/10 mix-blend-color" />
      </div>

      {/* Security Alert Pop-up */}
      {/* Security Alert Pop-up Removed */}

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-15 text-center ">
          <img
            src="https://i.ibb.co/LXwJLXBp/akatsukilogo-removebg-preview.png"
            alt="Akatsuki Logo"
            className="w-32 h-auto mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          />
        </div>

        {/* Card Body with Glassmorphism */}
        <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#e62429]/40 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#e62429]/40 rounded-br-3xl" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] text-[#e62429] uppercase tracking-[0.2em] block font-black">
                Team Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#e62429] transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  value={teamId}
                  disabled={isLoading}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-[#e62429] focus:bg-black/60 transition-all text-sm  disabled:opacity-50"
                  placeholder="ENTER NAME"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] text-[#e62429] uppercase tracking-[0.2em] block font-black">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#e62429] transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-[#e62429] focus:bg-black/60 transition-all text-sm  disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-[#e62429] text-[10px] font-black text-center animate-pulse uppercase tracking-[0.15em] py-3 border-y border-[#e62429]/20 bg-[#e62429]/5 rounded-lg">
                &gt;&gt; {error} &lt;&lt;
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative overflow-hidden py-5 rounded-xl bg-[#e62429] text-white font-black text-xs uppercase tracking-[0.4em] transition-all hover:shadow-[0_0_30px_rgba(230,36,41,0.4)] active:scale-95 shadow-lg disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Login"
                )}
              </span>

              {!isLoading && (
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Cinematic CRT/Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};

export default TeamLoginPage;
