
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken(): string | null {
  return localStorage.getItem("blip_token");
}

function setToken(token: string | null) {
  if (token) localStorage.setItem("blip_token", token);
  else localStorage.removeItem("blip_token");
}

export function clearAuth() {
  setToken(null);
}

async function request<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string }).message || data.error || res.statusText;
    throw new Error(typeof message === "string" ? message : "Request failed");
  }
  return data as T;
}

//auth
export interface LoginResponse {
  token: string;
  team: {
    _id: string;
    teamName: string;
    role: string;
    score: number;
  };
}

export async function login(teamName: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ teamName, password }),
    skipAuth: true,
  });
  setToken(data.token);
  return data;
}

export async function getMe() {
  return request<{
    _id: string;
    teamName: string;
    role: string;
    score: number;
    frozenUntil?: string | null;
    blockedUntil?: string | null;
    missionsCompleted?: number;
    buildMissionsCompleted?: number;
    stoneType?: Record<string, number>;
    stonesEarned?: number;
    pendingStoneCount?: number;
    shieldActive?: boolean;
    isFrozen?: boolean;
    activeEffects?: string[];
  }>("/api/auth/me");
}

export async function getAllTeams() {
  return request<
    Array<{
      _id: string;
      teamName: string;
      role: string;
      score: number;
      frozenUntil?: string | null;
      blockedUntil?: string | null;
      missionsCompleted?: number;
      buildMissionsCompleted?: number;
      activeEffects?: string[];
      stones?: string[];
      completedTimelines?: string[];
      snapActivated?: boolean;
    }>
  >("/api/auth/teams", { skipAuth: true });
}

export async function createTeam(teamName: string, password: string, role: string = "team") {
  return request<{ success: boolean; team: any }>("/api/admin/team/create", {
    method: "POST",
    body: JSON.stringify({ teamName, password, role }),
  });
}


export interface Mission {
  _id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  answer?: string;
  isActive?: boolean;
  timeline?: { key: string; name: string };
  difficulty?: string;
  options?: string[];
}

// Deprecated or Modified: The backend no longer exposes GET /api/missions list.
// New flow uses Timelines.

export async function getTimelines() {
  return request<{ timelines: string[] }>("/api/missions/timelines");
}

export async function enterTimeline(timeline: string) {
  return request<{ message: string }>("/api/missions/enter", {
    method: "POST",
    body: JSON.stringify({ timeline }),
  });
}

export async function getQuestionsForTimeline() {
  return request<{ questions: Mission[] }>("/api/missions/questions");
}

export async function getCurrentQuestion() {
  return request<{
    question: Mission | null;
    totalQuestions?: number;
    answeredCount?: number;
    remainingCount?: number;
    completed?: boolean;
    message?: string
  }>("/api/missions/current-question");
}

export async function submitAnswer(questionId: string, answer: string) {
  return request<{
    isCorrect: boolean;
    points: number;
    message: string;
    completed?: boolean;
    earnedStone?: string;
    timeline?: string;
  }>(
    "/api/missions/submit",
    { method: "POST", body: JSON.stringify({ questionId, answer }) }
  );
}

export async function exitTimeline() {
  return request<{ message: string }>("/api/missions/exit", { method: "POST" });
}

// Alias for backward compatibility if needed, but updated to use questionId payload
export async function submitMission(missionId: string, answer: string) {
  // @ts-ignore
  return submitAnswer(missionId, answer);
}

export async function getMissions(): Promise<Mission[]> {
  console.warn("getMissions is deprecated. Use Timeline API.");
  return [];
}

// --- Game ---
export interface GameState {
  _id: string;
  phase: string;
  startedAt: string | null;
  blipPhase: number | null;
  blipActive: boolean;
  lockdown: boolean;
  teams?: string[];
}

export async function getGameState(): Promise<GameState> {
  return request<GameState>("/api/game/state", { skipAuth: true });
}

export async function addTeamToGame(gameId: string, teamId: string) {
  return request<{ message: string }>("/api/admin/team/add", {
    method: "POST",
    body: JSON.stringify({ gameId, teamId }),
  });
}

export async function addTeamsToGame(gameId: string, teamIds: string[]) {
  return request<{ message: string }>("/api/admin/teams/add", {
    method: "POST",
    body: JSON.stringify({ gameId, teamIds }),
  });
}

export async function cleanupTeams(teamNames: string[]) {
  return request<{ message: string }>("/api/admin/cleanup/teams", {
    method: "POST",
    body: JSON.stringify({ teamNames }),
  });
}

export async function freezeTeamHandler(teamId: string) {
  return request<{ message: string }>("/api/admin/team/freeze", {
    method: "POST",
    body: JSON.stringify({ teamId }),
  });
}

export async function unfreezeTeamHandler(teamId: string) {
  return request<{ message: string }>("/api/admin/team/unfreeze", {
    method: "POST",
    body: JSON.stringify({ teamId }),
  });
}

export async function getAllQuestions() {
  return request<{ questions: any[] }>("/api/admin/questions");
}

export async function createQuestion(data: any) {
  return request<{ question: any }>("/api/admin/question/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createQuestionsBulk(questions: any[]) {
  return request<{ createdCount: number }>("/api/admin/questions/create-multiple", {
    method: "POST",
    body: JSON.stringify({ questions }),
  });
}

export async function addQuestionToGame(gameId: string, questionId: string) {
  return request<{ message: string }>("/api/admin/question/add", {
    method: "POST",
    body: JSON.stringify({ gameId, questionId }),
  });
}

export async function cleanupQuestions() {
  return request<{ message: string }>("/api/admin/cleanup/questions", {
    method: "POST",
  });
}

export async function getRegisteredTeams(): Promise<string[]> {
  return getAllTeams().then(teams => teams.map(team => team._id));
}

export async function getBlipPuzzle(): Promise<{ question: string } | null> {
  try {
    return await request<{ question: string }>("/api/game/blip-puzzle");
  } catch {
    return null;
  }
}


export async function createGame(name: string) {
  return request<{ game: { _id: string; name: string } }>("/api/game/create", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getWaitingGames() {
  return request<{ games: any[] }>("/api/game/waiting");
}

export async function startGame(gameId: string) {
  return request<{ message: string }>(`/api/game/start/${gameId}`, { method: "POST" });
}

export async function triggerBlip(phase: 1 | 2) {
  return request<{ message: string }>("/api/game/blip-trigger", {
    method: "POST",
    body: JSON.stringify({ phase }),
  });
}

export async function submitBlipPuzzle(answer: string) {
  return request<{ correct: boolean; points: number; message: string }>(
    "/api/game/blip-puzzle/submit",
    { method: "POST", body: JSON.stringify({ answer }) }
  );
}

export async function requestStoneUnlockPuzzle() {
  return request<{ puzzleId: number; question: string; message: string }>(
    "/api/game/stone-unlock/puzzle"
  );
}

export async function submitStoneUnlock(answer: string) {
  return request<{ correct: boolean; message: string }>(
    "/api/game/stone-unlock/submit",
    { method: "POST", body: JSON.stringify({ answer }) }
  );
}

export async function selectStoneType(stoneType: "block" | "shield") {
  return request<{ success: boolean; message: string; selectedStone: string; pendingRemaining: number }>(
    "/api/game/select-stone",
    { method: "POST", body: JSON.stringify({ stoneType }) }
  );
}

export async function requestBlockUnlockPuzzle() {
  return request<{ puzzleId: number; question: string; message: string }>(
    "/api/game/block-unlock/puzzle"
  );
}

export async function submitBlockUnlock(answer: string) {
  return request<{ success: boolean; message: string }>(
    "/api/game/block-unlock/submit",
    { method: "POST", body: JSON.stringify({ answer }) }
  );
}

export async function defendAttack(attackerId: string, action: "useShield" | "continue") {
  return request<{ success: boolean; message: string }>(
    "/api/game/defend-attack",
    { method: "POST", body: JSON.stringify({ attackerId, action }) }
  );
}

//stones 
export interface StoneStatus {
  stonesEarned: number;
  pendingStoneCount: number;
  stoneType: Record<string, number>;
  stonesUsed: number;
  shieldActive: boolean;
  shieldUsedInGame: boolean;
  cooldownUntil: string | null;
  blockedUntil: string | null;
  frozenUntil: string | null;
  isFrozen: boolean;
  editorState: string;
  activeEffects: string[];
  blipPuzzlesSolved: number;
  maxStones: number;
}

export async function getStoneStatus(): Promise<StoneStatus> {
  return request<StoneStatus>("/api/stones/status");
}

export async function useStone(stoneType: "shield" | "block", targetTeamId?: string) {
  return request<{ message: string }>("/api/stones/use", {
    method: "POST",
    body: JSON.stringify({ stoneType, targetTeamId, targetId: targetTeamId }),
  });
}


export async function useBlock(targetTeamId: string) {
  return request<{ message: string }>("/api/stones/use/block", {
    method: "POST",
    body: JSON.stringify({ targetId: targetTeamId }),
  });
}

// New Stone Usage Routes
export async function useTimeStone() {
  return request<{ message: string }>("/api/stones/use/time", { method: "POST" });
}

export async function useMindStone() {
  return request<{ message: string; hint: string }>("/api/stones/use/mind", { method: "POST" });
}

export async function useSpaceStone(timeline: string) {
  return request<{ message: string }>("/api/stones/use/space", {
    method: "POST",
    body: JSON.stringify({ timeline }),
  });
}

export async function usePowerStone(targetTeamId: string) {
  return request<{ message: string }>("/api/stones/use/power", {
    method: "POST",
    body: JSON.stringify({ targetTeamId }),
  });
}

export async function useRealityStone() {
  return request<{ message: string }>("/api/stones/use/reality", { method: "POST" });
}

export async function useSoulStone(sacrificedStone: string) {
  return request<{ message: string }>("/api/stones/use/soul", {
    method: "POST",
    body: JSON.stringify({ stone: sacrificedStone }),
  });
}

// --- Dashboard ---
export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  buildMissionsCompleted: number;
  finalSubmissionTime: string | null;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>("/api/dashboard/leaderboard", { skipAuth: true });
}

export async function getDashboardGameState(): Promise<GameState> {
  return request<GameState>("/api/dashboard/game-state", { skipAuth: true });
}

export { getToken, setToken };

export const unlockBlock = async (answer: string) => {
  const res = await fetch("/api/unlock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ answer })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Unlock failed");
  }

  return data;
};

// --- Dashboard & Combined Data ---

export type TimelineName = "newyork" | "morag" | "asgard" | "vormir";

/**
 * Standardized interface for the current team's state.
 * This aligns with the Mongoose teamSchema and your component requirements.
 */
export interface UserMe {
  _id: string;
  teamName: string;
  role: string;
  score: number;
  stones: string[];
  currentTimeline: string | null;
  escapedTimelines: string[];
  completedTimelines: string[];
  isFrozen: boolean;
  frozenUntil?: string | null;
  blockedUntil?: string | null;
  activeEffects: string[];
  snapActivated: boolean;
  gameStarted: boolean;
}

export interface DashboardData {
  leaderboard: LeaderboardEntry[];
  gameState: GameState;
  me: UserMe;
  timelines: TimelineName[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [leaderboard, gameState, rawMe, timelinesRes] = await Promise.all([
    getLeaderboard(),
    getDashboardGameState(),
    getMe(),
    getTimelines(),
  ]);

  // Transform rawMe to ensure all required fields from UserMe exist for the UI
  const me: UserMe = {
    _id: rawMe._id,
    teamName: rawMe.teamName,
    role: rawMe.role,
    score: rawMe.score,
    completedTimelines: (rawMe as any).completedTimelines || [],
    escapedTimelines: (rawMe as any).escapedTimelines || [],
    currentTimeline: (rawMe as any).currentTimeline || null,
    stones: (rawMe as any).stones || [],
    isFrozen: !!rawMe.isFrozen,
    frozenUntil: rawMe.frozenUntil,
    blockedUntil: rawMe.blockedUntil,
    activeEffects: rawMe.activeEffects || [],
    snapActivated: (rawMe as any).snapActivated || false,
    gameStarted: (rawMe as any).gameStarted || false,
  };

  return {
    leaderboard,
    gameState,
    me,
    timelines: (timelinesRes.timelines as TimelineName[]) || []
  };
}
