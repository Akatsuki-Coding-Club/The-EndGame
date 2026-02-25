import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { Shield, Users, Play, Database, Zap, PlusCircle, LayoutList, Activity, Unlock, Lock, ExternalLink, LogOut, Globe, CheckSquare, Trash2, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTeam, addTeamsToGame, cleanupTeams, getGameState, getAllQuestions, createQuestion, addQuestionToGame, cleanupQuestions, createQuestionsBulk, createGame, getWaitingGames } from "@/services/api";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const {
        puzzles,
        startGame,
        gameStarted,
        allTeamsState,
        freezeTeam,
        triggerBlip,
        unfreezeTeam,
        setGameDuration,
        gameDuration,
        refreshTeams,
        showToast,
    } = useGame();

    const maxLevel = puzzles.length || 15;
    const [activeTab, setActiveTab] = useState("orchestration");
    const [duration, setDuration] = useState(120);
    const [localDuration, setLocalDuration] = useState(gameDuration / 60);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamPassword, setNewTeamPassword] = useState("");

    // New State for Team Management
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
    const [dbGameId, setDbGameId] = useState<string | null>(null);
    // New State for Question Management
    const [adminQuestions, setAdminQuestions] = useState<any[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const [newInstanceName, setNewInstanceName] = useState("");
    const [waitingGames, setWaitingGames] = useState<any[]>([]);
    const [newQuestionTitle, setNewQuestionTitle] = useState(""); // used as 'question' in backend? or title? backend model has 'question' field
    const [newQuestionBrief, setNewQuestionBrief] = useState(""); // mapped to 'description'? backend model has 'question' which seems to be the text. 
    const [qTitle, setQTitle] = useState("");
    const [qContent, setQContent] = useState("");
    const [qAnswer, setQAnswer] = useState("");
    const [qPoints, setQPoints] = useState(100);
    const [qTimeline, setQTimeline] = useState("1");
    const [jsonBulkInput, setJsonBulkInput] = useState("");
    const [showJsonInput, setShowJsonInput] = useState(false);

    // Fetch Active Game ID on Mount
    useEffect(() => {
        getGameState().then(g => {
            if (g && g._id) setDbGameId(g._id);
        }).catch(() => console.log("No active game found"));
    }, []);

    // Fetch Questions when tab is active
    useEffect(() => {
        if (activeTab === "questions") {
            refreshQuestions();
        }
        if (activeTab === "orchestration") {
            loadWaitingGames();
        }
    }, [activeTab]);

    const loadWaitingGames = async () => {
        try {
            const data = await getWaitingGames();
            if (data && data.games) {
                setWaitingGames(data.games);
            }
        } catch (e) {
            console.error("Failed to load waiting games", e);
        }
    };

    const refreshQuestions = async () => {
        try {
            const data = await getAllQuestions();
            if (data && data.questions) {
                setAdminQuestions(data.questions);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const handleCreateTeam = async () => {
        if (!newTeamName.trim() || !newTeamPassword.trim()) {
            showToast("INPUT REQUIRED", "error", "NAME AND PASSWORD REQUIRED");
            return;
        }
        try {
            await createTeam(newTeamName, newTeamPassword);
            showToast("SUCCESS", "success", "UNIT REGISTERED SUCCESSFULLY");
            setNewTeamName("");
            setNewTeamPassword("");
            if (refreshTeams) refreshTeams();
        } catch (e: any) {
            showToast("DEPLOYMENT FAILED", "error", e.message);
        }
    };

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const mins = Number(e.target.value);
        setLocalDuration(mins);
        setGameDuration(mins); // Updates the global timer state immediately
    };

    useEffect(() => {
        if (activeTab === "teams" && refreshTeams) {
            refreshTeams();
        }
    }, [activeTab, refreshTeams]);

    // Team Selection Logic
    const toggleTeamSelection = (id: string) => {
        setSelectedTeamIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedTeamIds.length === allTeamsState.length) {
            setSelectedTeamIds([]);
        } else {
            setSelectedTeamIds(allTeamsState.map(t => t.teamId));
        }
    };

    const handleBulkAddToGame = async () => {
        if (!dbGameId) {
            showToast("ERROR", "error", "NO ACTIVE GAME INSTANCE FOUND");
            return;
        }
        if (selectedTeamIds.length === 0) return;

        try {
            await addTeamsToGame(dbGameId, selectedTeamIds);
            showToast("SUCCESS", "success", `ADDED ${selectedTeamIds.length} UNITS TO ACTIVE PROTOCOL`);
            setSelectedTeamIds([]);
            if (refreshTeams) refreshTeams();
        } catch (e: any) {
            showToast("OPERATION FAILED", "error", e.message);
        }
    };

    const handleCleanupTeams = async () => {
        if (selectedTeamIds.length === 0) return;

        // Map Ids to Names
        const teamNames = allTeamsState
            .filter(t => selectedTeamIds.includes(t.teamId))
            .map(t => t.teamName);

        if (!confirm(`CONFIRM TERMINATION OF ${teamNames.length} UNITS? THIS CANNOT BE UNDONE.`)) return;

        try {
            await cleanupTeams(teamNames);
            showToast("SUCCESS", "success", `TERMINATED ${teamNames.length} UNITS`);
            setSelectedTeamIds([]);
            if (refreshTeams) refreshTeams();
        } catch (e: any) {
            showToast("CLEANUP FAILED", "error", e.message);
        }
    };

    // Question Management Handlers
    const handleCreateQuestion = async () => {
        if (!qContent || !qAnswer) {
            showToast("INPUT REQUIRED", "error", "DATA AND KEY REQUIRED");
            return;
        }
        try {

            await createQuestion({
                timeline: parseInt(qTimeline) || 1,
                difficulty: "normal",
                question: qContent,
                options: [],
                answer: qAnswer,
                points: qPoints,
                isActive: true
            });
            showToast("SUCCESS", "success", "INTEL UPLOADED TO SERVER");
            setQContent("");
            setQAnswer("");
            setQPoints(100);
            refreshQuestions();
        } catch (e: any) {
            showToast("UPLOAD FAILED", "error", e.message);
        }
    };

    const handleAddQuestionToGame = async (qId: string) => {
        if (!dbGameId) {
            showToast("ERROR", "error", "NO ACTIVE GAME INSTANCE");
            return;
        }
        try {
            await addQuestionToGame(dbGameId, qId);
            showToast("SUCCESS", "success", "INTEL LINKED TO ACTIVE PROTOCOL");
        } catch (e: any) {
            showToast("LINK FAILED", "error", e.message);
        }
    };

    const handleCleanupQuestions = async () => {
        if (!confirm("PURGE ALL INTEL FROM DATABASE? THIS ACTION IS IRREVERSIBLE.")) return;
        try {
            await cleanupQuestions();
            showToast("SUCCESS", "success", "DATABASE PURGED");
            refreshQuestions();
        } catch (e: any) {
            showToast("PURGE FAILED", "error", e.message);
        }
    }

    // Question selection helpers
    const toggleQuestionSelection = (id: string) => {
        setSelectedQuestionIds(prev =>
            prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
        );
    };

    const handleSelectAllQuestions = () => {
        if (selectedQuestionIds.length === adminQuestions.length) {
            setSelectedQuestionIds([]);
        } else {
            setSelectedQuestionIds(adminQuestions.map(q => q._id));
        }
    };

    const handleBulkAddQuestionsToGame = async () => {
        if (!dbGameId) { showToast("ERROR", "error", "NO ACTIVE GAME INSTANCE"); return; }
        if (selectedQuestionIds.length === 0) return;
        try {
            await Promise.all(selectedQuestionIds.map(qid => addQuestionToGame(dbGameId, qid)));
            showToast("SUCCESS", "success", `LINKED ${selectedQuestionIds.length} INTEL ITEMS TO PROTOCOL`);
            setSelectedQuestionIds([]);
        } catch (e: any) {
            showToast("BULK LINK FAILED", "error", e.message);
        }
    };

    // Group questions by timeline (sorted by year) then by difficulty within each group
    const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

    const getGroupedQuestions = () => {
        const groups: Record<string, { key: string; name: string; year: number; questions: any[] }> = {};
        for (const q of adminQuestions) {
            const tlKey = q.timeline?.key || 'unknown';
            if (!groups[tlKey]) {
                groups[tlKey] = {
                    key: tlKey,
                    name: q.timeline?.name || tlKey,
                    year: q.timeline?.year ?? 9999,
                    questions: []
                };
            }
            groups[tlKey].questions.push(q);
        }
        // Sort each group's questions by difficulty
        for (const g of Object.values(groups)) {
            g.questions.sort((a, b) =>
                (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99)
            );
        }
        // Sort groups by year
        return Object.values(groups).sort((a, b) => a.year - b.year);
    };

    const handleJsonSubmit = async () => {
        try {
            if (!jsonBulkInput.trim()) {
                showToast("INPUT REQUIRED", "error", "PLEASE PASTE VALID JSON");
                return;
            }
            // Strip out single and multi-line comments while preserving contents inside strings
            const cleanedInput = jsonBulkInput.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
            const json = JSON.parse(cleanedInput);
            if (!Array.isArray(json)) {
                showToast("INVALID JSON", "error", "MUST BE AN ARRAY OF QUESTIONS");
                return;
            }
            const res = await createQuestionsBulk(json);
            showToast("SUCCESS", "success", `UPLOADED ${res.createdCount} INTEL ITEMS`);
            refreshQuestions();
            setJsonBulkInput("");
            setShowJsonInput(false);
        } catch (err: any) {
            showToast("UPLOAD FAILED", "error", err.message);
        }
    };

    const navItems = [
        { id: "orchestration", label: "Orchestration", icon: <Database size={14} /> },
        { id: "game", label: "Game Management", icon: <PlusCircle size={14} /> },
        { id: "questions", label: "Intel Repository", icon: <LayoutList size={14} /> },
        { id: "teams", label: "Active Units", icon: <Users size={14} /> },
        { id: "live", label: "Live Operations", icon: <Zap size={14} /> }
    ];

    return (
        <div className="min-h-screen bg-black text-cyan-500 font-sans relative overflow-hidden selection:bg-cyan-500/30 selection:text-white">

            {/* ════════════ BACKGROUND LAYERS () ════════════ */}
            {/* Background elements removed as per request */}

            {/* ════════════ TOP NAVIGATION BAR ════════════ */}
            <nav className="fixed top-0 left-0 w-full z-50 border-b border-cyan-500/30 bg-black/80 backdrop-blur-xl h-16 flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(0,255,255,0.1)]">
                {/* Branding */}
                <div className="flex items-center gap-3">
                    <img src="/akatsukilogo.png" alt="Akatsuki Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                    <div className="hidden md:block">
                        <h1 className="text-xs  tracking-[0.2em] text-white uppercase drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                            AKATSUKI CODING CLUB
                        </h1>
                        <div className="flex items-center gap-2 text-[8px] text-cyan-400  uppercase tracking-widest">
                            <Globe size={10} className={gameStarted ? "animate-pulse text-green-500" : "text-cyan-500"} />
                            <span>SYS: {gameStarted ? "ONLINE" : "STANDBY"}</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient px-4">
                    {navItems.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase  tracking-widest transition-all border border-transparent rounded-sm whitespace-nowrap ${activeTab === tab.id
                                ? "bg-cyan-500/10 border-b-2 border-b-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                                : "text-slate-500 hover:text-cyan-300 hover:bg-cyan-950/20"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/leaderboard")}
                        className="hidden md:flex items-center gap-2 px-4 py-2 border border-cyan-500/30 text-[9px] uppercase  tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all group"
                    >
                        <Activity size={12} className="group-hover:animate-pulse" /> Live Leaderboard
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </nav>

            {/* ════════════ MAIN CONTENT ════════════ */}
            <main className="relative z-10 pt-24 pb-10 px-6 max-w-7xl mx-auto min-h-screen">

                {/* 1. ORCHESTRATION TAB */}
                {activeTab === "orchestration" && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="mt-8 border border-cyan-500/30 bg-black/60 backdrop-blur-md p-8 relative overflow-hidden group">
                            {/* Decorative Corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500" />

                            <h3 className="text-xl  mb-8 flex items-center gap-3 tracking-[0.2em] text-white">
                                <Shield className="text-cyan-500" /> MISSION INITIALIZATION PROTOCOL
                            </h3>

                            <div className="mb-8">
                                <label className="text-[10px] uppercase text-cyan-600  tracking-widest block mb-2">
                                    Target Game Instance
                                </label>
                                <select
                                    className="w-full bg-cyan-950/10 border border-cyan-500/30 p-3 text-cyan-400 font-sans text-xs outline-none focus:border-cyan-400"
                                    value={dbGameId || ""}
                                    onChange={(e) => setDbGameId(e.target.value)}
                                >
                                    <option value="" disabled>SELECT A WAITING INSTANCE...</option>
                                    {waitingGames.map(g => (
                                        <option key={g._id} value={g._id}>
                                            {g.name || g._id} (ID: {g._id.slice(-6)}) - {g.status}
                                        </option>
                                    ))}
                                </select>
                                <div className="text-[9px] text-cyan-700 mt-2 flex items-center gap-2">
                                    <button onClick={loadWaitingGames} className="hover:text-cyan-400 underline">REFRESH LIST</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-cyan-600  tracking-widest">
                                        Mission Time (Minutes)
                                    </label>
                                    <div className="relative group/input">
                                        <input
                                            type="number"
                                            value={localDuration}
                                            disabled={gameStarted}
                                            onChange={handleDurationChange}
                                            className="w-full bg-cyan-950/10 border-b border-cyan-800 py-3 px-4 text-2xl  text-cyan-400 focus:border-cyan-400 outline-none transition-all disabled:opacity-50"
                                        />
                                        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-500 transition-all duration-300 group-hover/input:w-full" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-cyan-600  tracking-widest">
                                        System State
                                    </label>
                                    <div className={`p-4 border ${gameStarted ? "border-green-500/30 bg-green-950/10 text-green-400" : "border-red-500/30 bg-red-950/10 text-red-400"}  tracking-[0.2em] text-center uppercase`}>
                                        {gameStarted ? "• ACTIVE_OPERATIONS •" : "• STANDBY_MODE •"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => {
                                        if (dbGameId) {
                                            startGame(dbGameId);
                                            showToast("SYSTEM_ONLINE", "success", "Mission clock started.");
                                        } else {
                                            showToast("ERROR", "error", "NO ACTIVE GAME INSTANCE TO START");
                                        }
                                    }}
                                    className={`relative overflow-hidden group bg-cyan-900/20 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_cyan] text-cyan-400 px-10 py-4  uppercase text-xs tracking-[0.3em] transition-all disabled:opacity-30 disabled:cursor-not-allowed ${gameStarted && !dbGameId ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        <Play size={16} className={gameStarted && !dbGameId ? "" : "group-hover:fill-current"} />
                                        {gameStarted && !dbGameId ? "PROTOCOL ENGAGED" : "INITIATE LAUNCH"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. GAME MANAGEMENT TAB */}
                {activeTab === "game" && (
                    <div className="flex justify-center animate-fade-in-up pb-24 pt-10">
                        {/* Create Instance */}
                        <div className="w-full max-w-lg p-8 relative">
                            <h3 className="text-xs  uppercase text-cyan-600 mb-6 tracking-widest border-b border-cyan-900/50 pb-2">
                                Create Game Instance
                            </h3>
                            <input
                                className="w-full bg-cyan-950/10 border border-cyan-900/50 p-4 text-sm mb-6 outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900"
                                placeholder="ENTER INSTANCE NAME..."
                                value={newInstanceName}
                                onChange={(e) => setNewInstanceName(e.target.value)}
                            />
                            <button
                                onClick={async () => {
                                    if (!newInstanceName) return showToast("ERROR", "error", "INSTANCE NAME REQUIRED");
                                    try {
                                        const res = await createGame(newInstanceName);
                                        setDbGameId(res.game._id);
                                        showToast("SUCCESS", "success", "GAME INSTANCE INITIALIZED: " + res.game.name);
                                        setNewInstanceName("");
                                    } catch (e: any) {
                                        showToast("INIT FAILED", "error", e.message);
                                    }
                                }}
                                className="w-full border border-cyan-500/30 text-cyan-400 py-3 text-[10px] uppercase  hover:bg-cyan-500 hover:text-black transition-all tracking-widest"
                            >
                                Initialize Instance
                            </button>
                        </div>

                        {/* Config Instance */}
                        {/* <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-md p-6 relative">
                            <h3 className="text-xs  uppercase text-cyan-600 mb-6 tracking-widest border-b border-cyan-900/50 pb-2">
                                Instance Configuration
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] uppercase text-cyan-700 mb-2 block  tracking-widest">
                                        Attach Units
                                    </label>
                                    <select className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-400 uppercase">
                                        <option>Select Batch (Team 1-15)</option>
                                        <option>Select All Registered</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase text-cyan-700 mb-2 block  tracking-widest">
                                        Assign Intel
                                    </label>
                                    <select multiple className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs h-32 outline-none focus:border-cyan-500/50 text-cyan-400 uppercase font-sans scrollbar-thin">
                                        {puzzles.map(p => (
                                            <option key={p.id} value={p.id} className="p-1 hover:bg-cyan-900/30 cursor-pointer">
                                                {p.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div> */}
                    </div>
                )}

                {/* 3. INTEL REPOSITORY TAB - UPDATED with Question Management */}
                {activeTab === "questions" && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Form */}
                            <div className="lg:col-span-1 border border-cyan-500/30 bg-black/60 backdrop-blur-md p-6 h-fit sticky top-24">
                                <h4 className="text-[10px]  uppercase text-cyan-600 mb-6 tracking-widest border-b border-cyan-900/50 pb-2">
                                    New Intel Form
                                </h4>
                                <div className="space-y-4">
                                    <select className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-400 uppercase ">
                                        <option>Standard Mission</option>
                                        <option>Blip Puzzle</option>
                                    </select>
                                    <input
                                        className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900  tracking-wider"
                                        placeholder="TIMELINE ID (e.g. 1, 2)..."
                                        type="number"
                                        value={qTimeline}
                                        onChange={e => setQTimeline(e.target.value)}
                                    />
                                    <textarea
                                        className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs h-24 outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900 font-sans"
                                        placeholder="ENCRYPTED DATA (QUESTION)..."
                                        value={qContent}
                                        onChange={e => setQContent(e.target.value)}
                                    />
                                    <input
                                        className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900 tracking-wider"
                                        placeholder="DECRYPTION KEY (ANSWER)..."
                                        value={qAnswer}
                                        onChange={e => setQAnswer(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="w-full bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900 tracking-wider"
                                        placeholder="POINT VALUE..."
                                        value={qPoints}
                                        onChange={e => setQPoints(parseInt(e.target.value))}
                                    />

                                    <button
                                        onClick={handleCreateQuestion}
                                        className="w-full bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black py-4  text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        <PlusCircle size={14} /> Upload to Server
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="lg:col-span-2">
                                {/* Toolbar */}
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-[10px]  uppercase text-cyan-600 tracking-widest">Active Intel Database ({adminQuestions.length})</h4>
                                        {/* Select All */}
                                        <button
                                            onClick={handleSelectAllQuestions}
                                            className="flex items-center gap-2 text-[8px]  uppercase tracking-widest border px-3 py-1 transition-all
                                                       border-cyan-700/50 text-cyan-500 hover:bg-cyan-500 hover:text-black"
                                        >
                                            <CheckSquare size={10} />
                                            {selectedQuestionIds.length === adminQuestions.length && adminQuestions.length > 0
                                                ? "DESELECT ALL"
                                                : `SELECT ALL (${adminQuestions.length})`}
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowJsonInput(!showJsonInput)}
                                            className="text-[8px] text-cyan-500 hover:text-cyan-400 border border-cyan-700/50 px-3 py-1 uppercase  tracking-widest hover:bg-cyan-950/30 transition-all flex items-center gap-2"
                                        >
                                            <Database size={10} /> {showJsonInput ? "CANCEL IMPORT" : "IMPORT JSON"}
                                        </button>
                                        <button onClick={handleCleanupQuestions} className="text-[8px] text-red-500 hover:text-red-400 border border-red-900/50 px-3 py-1 uppercase  tracking-widest hover:bg-red-950/30 transition-all flex items-center gap-2">
                                            <Trash2 size={10} /> PURGE DATABASE
                                        </button>
                                    </div>
                                </div>

                                {/* JSON Input Area */}
                                {showJsonInput && (
                                    <div className="mb-4 p-4 border border-cyan-500/30 bg-cyan-950/20">
                                        <textarea
                                            value={jsonBulkInput}
                                            onChange={(e) => setJsonBulkInput(e.target.value)}
                                            className="w-full h-32 bg-black/50 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900/50 font-sans mb-2"
                                            placeholder={`[\n  {\n    "timeline": {\n      "key": "newyork",\n      "name": "New York"\n    },\n    "difficulty": "medium",\n    "question": "What happens?",\n    "answer": "answer here",\n    "points": 100\n  }\n]`}
                                        />
                                        <button
                                            onClick={handleJsonSubmit}
                                            className="w-full bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black py-2  text-[10px] uppercase tracking-[0.2em] transition-all"
                                        >
                                            Submit JSON Data
                                        </button>
                                    </div>
                                )}

                                {/* Grouped Question List */}
                                <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                                    {adminQuestions.length === 0 && (
                                        <div className="text-center py-10 text-cyan-900 text-xs uppercase tracking-widest">
                                            NO INTEL FOUND IN SERVER
                                        </div>
                                    )}
                                    {getGroupedQuestions().map((group) => (
                                        <div key={group.key}>
                                            {/* Timeline Header */}
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px]  uppercase tracking-[0.25em] text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1">
                                                        {group.name}
                                                    </span>
                                                    <span className="text-[8px]  text-cyan-700 uppercase tracking-widest">• {group.year}</span>
                                                    <span className="text-[8px] text-cyan-800 uppercase">({group.questions.length} questions)</span>
                                                </div>
                                                <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-500/30 to-transparent" />
                                            </div>

                                            {/* Difficulty sub-groups */}
                                            {(['easy', 'medium', 'hard'] as const).map(diff => {
                                                const dqs = group.questions.filter(q => q.difficulty === diff);
                                                if (dqs.length === 0) return null;
                                                const diffColors: Record<string, string> = {
                                                    easy: 'text-green-400  border-green-500/30  bg-green-950/10',
                                                    medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/10',
                                                    hard: 'text-red-400    border-red-500/30    bg-red-950/10',
                                                };
                                                const diffDot: Record<string, string> = {
                                                    easy: 'bg-green-500',
                                                    medium: 'bg-yellow-500',
                                                    hard: 'bg-red-500',
                                                };
                                                return (
                                                    <div key={diff} className="mb-4">
                                                        {/* Difficulty label */}
                                                        <div className="flex items-center gap-2 mb-2 pl-1">
                                                            <span className={`w-[6px] h-[6px] rounded-full ${diffDot[diff]}`} />
                                                            <span className={`text-[8px]  uppercase tracking-[0.3em] ${diffColors[diff].split(' ')[0]}`}>
                                                                {diff}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2 pl-3">
                                                            {dqs.map((q) => (
                                                                <div
                                                                    key={q._id}
                                                                    onClick={() => toggleQuestionSelection(q._id)}
                                                                    className={`bg-black/40 border p-4 flex justify-between items-center group
                                                                        hover:bg-cyan-950/10 transition-all backdrop-blur-sm cursor-pointer
                                                                        ${selectedQuestionIds.includes(q._id)
                                                                            ? 'border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.15)]'
                                                                            : 'border-cyan-900/30 hover:border-cyan-500/50'
                                                                        }`}
                                                                >
                                                                    {/* Checkbox */}
                                                                    <div className="mr-3 flex-shrink-0">
                                                                        <div className={`w-4 h-4 border flex items-center justify-center transition-all ${selectedQuestionIds.includes(q._id)
                                                                            ? 'bg-cyan-500 border-cyan-500'
                                                                            : 'border-cyan-700/50 bg-black/50'
                                                                            }`}>
                                                                            {selectedQuestionIds.includes(q._id) && <CheckSquare size={10} className="text-black" />}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1 mr-4 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className={`text-[8px]  uppercase px-2 py-0.5 border rounded-sm ${diffColors[diff]}`}>
                                                                                {diff}
                                                                            </span>
                                                                            <span className="text-[10px] font-sans text-cyan-400  drop-shadow-[0_0_5px_cyan]">
                                                                                {q.points} PTS
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[10px] text-cyan-200/80 max-w-md truncate font-sans">{q.question}</p>
                                                                        <p className="text-[8px] text-cyan-900 mt-1 font-sans uppercase">
                                                                            Key: <span className="text-cyan-700">{q.answer}</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right flex items-center gap-2 flex-shrink-0">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleAddQuestionToGame(q._id); }}
                                                                            className="text-[9px] border border-cyan-700/50 px-3 py-2 text-cyan-500 hover:bg-cyan-500 hover:text-black uppercase  tracking-widest transition-all flex items-center gap-2"
                                                                        >
                                                                            <Zap size={10} /> LINK
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Floating bulk-action toolbar for questions */}
                                {selectedQuestionIds.length > 0 && (
                                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#050a10]/95 backdrop-blur-xl border border-cyan-500 p-4 shadow-[0_0_50px_rgba(0,255,255,0.3)] flex items-center gap-6 animate-fade-in-up rounded-none">
                                        <div className="text-xs  text-cyan-400 uppercase tracking-widest border-r border-cyan-800 pr-6">
                                            {selectedQuestionIds.length} INTEL SELECTED
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleBulkAddQuestionsToGame}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-black text-[10px] uppercase  tracking-wider transition-all"
                                            >
                                                <Zap size={14} /> Link All to Game
                                            </button>
                                            <button
                                                onClick={() => setSelectedQuestionIds([])}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-900/30 border border-slate-600/50 text-slate-400 hover:bg-slate-700 hover:text-white text-[10px] uppercase  tracking-wider transition-all"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. ACTIVE UNITS TAB */}
                {activeTab === "teams" && (
                    <div className="space-y-8 animate-fade-in-up pb-24">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-cyan-900/30">
                            <h3 className="text-xl  uppercase tracking-[0.2em] text-white">
                                <Users className="inline mr-2 text-cyan-500" size={20} /> Field Units Status
                            </h3>
                            <div className="flex gap-4">
                                <button onClick={handleSelectAll} className="text-[10px] border border-cyan-700/50 px-4 py-2 text-cyan-500 hover:bg-cyan-500/10 uppercase  tracking-widest transition-all">
                                    {selectedTeamIds.length === allTeamsState.length ? "Deselect All" : "Select All"}
                                </button>
                                <button className="text-[10px] border border-cyan-700/50 px-6 py-2 text-cyan-500 hover:bg-cyan-500 hover:text-black uppercase  tracking-widest transition-all">
                                    Import Personnel (CSV)
                                </button>
                            </div>
                        </div>

                        {/* Create Team Form */}
                        <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-md p-6 mb-8 relative">
                            <h4 className="text-xs  uppercase tracking-[0.2em] text-cyan-600 mb-6 border-b border-cyan-900/50 pb-2">
                                <PlusCircle className="inline mr-2" size={14} /> Register New Unit
                            </h4>
                            <div className="flex gap-4">
                                <input
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="flex-1 bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900 "
                                    placeholder="UNIT DESIGNATION (NAME)..."
                                />
                                <input
                                    type="password"
                                    value={newTeamPassword}
                                    onChange={(e) => setNewTeamPassword(e.target.value)}
                                    className="flex-1 bg-cyan-950/10 border border-cyan-900/50 p-3 text-xs outline-none focus:border-cyan-500/50 text-cyan-100 placeholder-cyan-900 "
                                    placeholder="ACCESS CODE (PASSWORD)..."
                                />
                                <button
                                    onClick={handleCreateTeam}
                                    className="bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black px-6  text-[10px] uppercase tracking-[0.2em] transition-all"
                                >
                                    DEPLOY
                                </button>
                            </div>
                        </div>

                        {/* Floating Selection Toolbar */}
                        {selectedTeamIds.length > 0 && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#050a10]/95 backdrop-blur-xl border border-cyan-500 p-4 shadow-[0_0_50px_rgba(0,255,255,0.3)] flex items-center gap-6 animate-fade-in-up w-auto rounded-none">
                                <div className="text-xs  text-cyan-400 uppercase tracking-widest border-r border-cyan-800 pr-6">
                                    {selectedTeamIds.length} UNITS SELECTED
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleBulkAddToGame}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-black text-[10px] uppercase  tracking-wider transition-all"
                                    >
                                        <ArrowUpRight size={14} /> Add to Active Protocol
                                    </button>
                                    <button
                                        onClick={() => {
                                            selectedTeamIds.forEach(id => freezeTeam(id));
                                            setSelectedTeamIds([]);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/50 text-blue-300 hover:bg-blue-500 hover:text-black text-[10px] uppercase  tracking-wider transition-all"
                                    >
                                        <Lock size={14} /> FREEZE
                                    </button>
                                    <button
                                        onClick={() => {
                                            selectedTeamIds.forEach(id => unfreezeTeam(id));
                                            setSelectedTeamIds([]);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/50 text-green-300 hover:bg-green-500 hover:text-black text-[10px] uppercase  tracking-wider transition-all"
                                    >
                                        <Unlock size={14} /> UNFREEZE
                                    </button>
                                    <button
                                        onClick={handleCleanupTeams}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] uppercase  tracking-wider transition-all"
                                    >
                                        <Trash2 size={14} /> TERMINATE / CLEANUP
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allTeamsState.map(t => (
                                <div key={t.teamId} className="relative group">
                                    {/* Main Card */}
                                    <div className={`bg-[#050a10]/90 backdrop-blur-xl border p-5 relative overflow-hidden transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] h-32 flex flex-col justify-between z-10 ${selectedTeamIds.includes(t.teamId) ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "border-cyan-500/30 hover:border-cyan-400"}`}>

                                        {/* Selection Checkbox (Top Left) */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); toggleTeamSelection(t.teamId); }}
                                            className="absolute top-0 left-0 p-2 z-30 cursor-pointer group/check"
                                        >
                                            <div className={`w-4 h-4 border ${selectedTeamIds.includes(t.teamId) ? "bg-cyan-500 border-cyan-500" : "border-cyan-500/50 bg-black/50"} flex items-center justify-center transition-all`}>
                                                {selectedTeamIds.includes(t.teamId) && <CheckSquare size={10} className="text-black" />}
                                            </div>
                                        </div>

                                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                                        <div>
                                            <div className="absolute top-0 right-0 p-2 text-[8px] text-cyan-500/70 font-sans  tracking-widest uppercase">
                                                UID: {t.teamId.slice(-6)}
                                            </div>

                                            <h4 className=" text-cyan-400 mb-1 text-sm drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] truncate pr-16 bg-transparent pl-6">
                                                {t.teamName}
                                            </h4>

                                            <p className="text-[9px] text-cyan-600  tracking-wider pl-6">
                                                <span className="uppercase">ASSIGNMENT:</span> M-{t.currentLevel.toString().padStart(2, "0")}
                                            </p>
                                        </div>

                                        {/* Status Line */}
                                        <div className="flex gap-2 mt-2 pl-6">
                                            {t.isFrozen && <span className="text-[8px]  text-black bg-cyan-500 px-1 uppercase">FROZEN</span>}
                                            {t.isBlocked && <span className="text-[8px]  text-white bg-red-600 px-1 uppercase">BLOCKED</span>}
                                            {t.snapActivated && <span className="text-[8px]  text-white bg-purple-600 px-1 uppercase animate-pulse">SNAP</span>}
                                        </div>

                                        {/* Scan Line Effect */}
                                        <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-scan-fast pointer-events-none" />
                                    </div>

                                    {/* HOVER DIALOG BOX (Absolute Overlay) */}
                                    <div className="absolute top-0 left-full ml-4 w-64 bg-black/95 border border-cyan-500/50 p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                                        <h5 className="text-xs  text-cyan-400 border-b border-cyan-900/50 pb-2 mb-3 uppercase tracking-widest">
                                            UNIT DATA SHEET
                                        </h5>

                                        <div className="space-y-3 font-sans">
                                            <div>
                                                <label className="text-[8px] text-cyan-600 uppercase  block">FULL ID</label>
                                                <div className="text-[9px] text-cyan-100 break-all">{t.teamId}</div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[8px] text-cyan-600 uppercase  block">SCORE</label>
                                                    <div className="text-[10px] text-cyan-100">{t.score}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[8px] text-cyan-600 uppercase  block">ROLE</label>
                                                    <div className="text-[10px] text-cyan-100">{t.role}</div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[8px] text-cyan-600 uppercase  block mb-1">INFINITY STONES</label>
                                                <div className="flex gap-1 flex-wrap">
                                                    {['space', 'mind', 'reality', 'power', 'time', 'soul'].map(stone => {
                                                        const hasStone = t.stones?.includes(stone);
                                                        const colors: Record<string, string> = {
                                                            space: "bg-blue-500 shadow-[0_0_5px_blue]",
                                                            mind: "bg-yellow-500 shadow-[0_0_5px_yellow]",
                                                            reality: "bg-red-500 shadow-[0_0_5px_red]",
                                                            power: "bg-purple-500 shadow-[0_0_5px_purple]",
                                                            time: "bg-green-500 shadow-[0_0_5px_green]",
                                                            soul: "bg-orange-500 shadow-[0_0_5px_orange]",
                                                        };
                                                        return (
                                                            <div
                                                                key={stone}
                                                                className={`w-2 h-2 rounded-full ${hasStone ? colors[stone] : "bg-slate-900 border border-slate-800"}`}
                                                                title={stone}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[8px] text-cyan-600 uppercase  block">COMPLETED TIMELINES</label>
                                                <div className="text-[9px] text-cyan-100 leading-tight">
                                                    {t.completedTimelines?.length > 0 ? t.completedTimelines.join(", ") : "None"}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[8px] text-cyan-600 uppercase  block">STATUS</label>
                                                <div className="text-[9px] text-white">
                                                    {t.isFrozen ? "FROZEN " : ""}{t.isBlocked ? "BLOCKED " : ""}{t.snapActivated ? "SNAP_ACTIVE" : ""}{(!t.isFrozen && !t.isBlocked && !t.snapActivated) ? "NORMAL" : ""}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-cyan-900/30">
                                                {t.isFrozen ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            unfreezeTeam(t.teamId);
                                                        }}
                                                        className="flex-1 bg-green-900/20 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black py-2  text-[8px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Unlock size={10} /> UNFREEZE UNIT
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            freezeTeam(t.teamId);
                                                        }}
                                                        className="flex-1 bg-blue-900/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-black py-2  text-[8px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Lock size={10} /> FREEZE UNIT
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Connector Line */}
                                        <div className="absolute top-8 -left-4 w-4 h-[1px] bg-cyan-500/50" />
                                        <div className="absolute top-8 -left-1 w-1 h-1 bg-cyan-500 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. LIVE OPERATIONS TAB */}
                {activeTab === "live" && (
                    <div className="space-y-12 animate-fade-in-up">
                        {/* Red Alert Section for Override */}
                        <div className="bg-red-950/10 border border-red-500/30 p-8 flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl  text-red-500 tracking-[0.2em] uppercase mb-1 drop-shadow-[0_0_10px_red]">Live System Override</h3>
                                <p className="text-[10px] text-red-700  uppercase tracking-[0.3em]">Priority Alpha Level Clearance</p>
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                                <span className="text-xs font-sans text-red-500  tracking-widest">SYSTEM_LIVE</span>
                            </div>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,red_1px,transparent_1px)] bg-[size:10px_10px]" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Blip Control */}
                            <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-md p-8 relative">
                                <h4 className="text-xs  uppercase tracking-[0.2em] text-white mb-8 border-b border-cyan-900/50 pb-2">
                                    <Zap className="inline mr-2 text-cyan-500" size={14} /> Global Blip Protocol
                                </h4>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => triggerBlip(1)}
                                        className="w-full group relative flex items-center justify-between p-6 bg-cyan-950/10 border border-cyan-500/30 hover:bg-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all overflow-hidden"
                                    >
                                        <div className="text-left z-10">
                                            <span className="text-[9px]  text-cyan-500 uppercase tracking-[0.3em]">Phase 01</span>
                                            <h5 className="text-lg  text-white uppercase tracking-wider mt-1">Initiate Initial Blip</h5>
                                            <p className="text-[8px] text-cyan-700 uppercase mt-2 ">Targets: 15 Randomized Units</p>
                                        </div>
                                        <Zap className="text-cyan-600 group-hover:text-cyan-400 group-hover:scale-125 transition-transform" size={40} />
                                    </button>

                                    <button
                                        onClick={() => triggerBlip(2)}
                                        className="w-full group relative flex items-center justify-between p-6 bg-purple-950/10 border border-purple-500/30 hover:bg-purple-900/20 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all overflow-hidden"
                                    >
                                        <div className="text-left z-10">
                                            <span className="text-[9px]  text-purple-500 uppercase tracking-[0.3em]">Phase 02</span>
                                            <h5 className="text-lg  text-white uppercase tracking-wider mt-1">Initiate Final Blip</h5>
                                            <p className="text-[8px] text-purple-700 uppercase mt-2 ">Targets: All Remaining Units</p>
                                        </div>
                                        <Zap className="text-purple-600 group-hover:text-purple-400 group-hover:scale-125 transition-transform" size={40} />
                                    </button>
                                </div>
                            </div>

                            {/* Unit Status Monitor */}
                            <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-md p-8 flex flex-col h-[500px]">
                                <h4 className="text-xs  uppercase tracking-[0.2em] text-white mb-6 border-b border-cyan-900/50 pb-2">
                                    <Activity className="inline mr-2 text-green-500" size={14} /> Tactical Unit Status
                                </h4>

                                <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                                    {allTeamsState.map(t => (
                                        <div key={t.teamId} className="flex items-center justify-between p-3 bg-black/40 border border-cyan-900/30 hover:border-cyan-500/30 transition-all">
                                            <div>
                                                <span className="text-xs  text-cyan-100 uppercase tracking-wider">{t.teamName}</span>
                                                <div className="flex gap-2 mt-1">
                                                    {t.isFrozen && <span className="text-[8px]  text-cyan-400 bg-cyan-950/50 px-1 border border-cyan-500/30 uppercase">[FROZEN]</span>}
                                                    {t.isBlocked && <span className="text-[8px]  text-red-500 bg-red-950/50 px-1 border border-red-500/30 uppercase">[BLOCKED]</span>}
                                                    {!t.isFrozen && !t.isBlocked && <span className="text-[8px]  text-green-500 bg-green-950/50 px-1 border border-green-500/30 uppercase">[ACTIVE]</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {t.isFrozen ? (
                                                    <button onClick={() => unfreezeTeam(t.teamId)} className="p-2 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all" title="Unfreeze">
                                                        <Unlock size={14} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => freezeTeam(t.teamId)} className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black transition-all" title="Freeze">
                                                        <Lock size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
