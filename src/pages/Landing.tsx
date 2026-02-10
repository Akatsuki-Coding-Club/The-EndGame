import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();
    const handleStartRound = () => {
        // Enter Fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }

        // navigate with REPLACE so they can't go back to Landing
        navigate("/login", { replace: true });
    };
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">

            {/* Video Background Layer */}
            <div className="absolute inset-0 z-0 bg-[#272227]">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover opacity-50"
                >
                    <source
                        src="https://motionbgs.com/media/2871/avengers-heroes-united.960x540.mp4"
                        type="video/mp4"
                    />
                </video>
                {/* Subtle gradient to blend video edges and ensure text clarity */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#272227]/60 via-transparent to-[#272227]/80" />
            </div>

            {/* Content Layer - Set to transparent to avoid "boxes" */}
            <div className="relative z-10 flex flex-col items-center p-12 w-full bg-transparent">

                {/* Akatsuki Logo at x-center y-top */}
                <div className="mt-6">
                    <img
                        src="https://i.ibb.co/LXwJLXBp/akatsukilogo-removebg-preview.png"
                        alt="Akatsuki Logo"
                        className="w-[14rem] h-auto object-contain"
                    />
                </div>

                {/* "Presents" text */}
                <div className="mb-3">
                    <p className="text-sm tracking-[0.3em] uppercase opacity-60 font-light">
                        Presents
                    </p>
                </div>

                {/* Event Name: Akatsuki Converges */}
                <div className="mb-3 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
                        Akatsuki Converges
                    </h1>
                </div>

                {/* Round Name: The Endgame */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-medium tracking-widest uppercase text-red-600 drop-shadow-lg">
                        The Endgame
                    </h2>
                </div>

                {/* Navigation Button */}
                <button
                    onClick={handleStartRound}
                    className="px-10 py-3 border border-white/40 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-[#272227] transition-all duration-300 rounded text-sm font-bold uppercase tracking-[0.2em]"
                >
                    Start Round 3
                </button>
            </div>
        </div>
    );
};

export default Landing;