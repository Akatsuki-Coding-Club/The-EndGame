
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    }>
  >("/api/auth/teams", { skipAuth: true });
}

export interface Mission {
  _id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  answer?: string;
  isActive?: boolean;
}

export async function getMissions(): Promise<Mission[]> {
  return request<Mission[]>("/api/missions");
}

export async function getMissionById(missionId: string) {
  return request<{ success: boolean; mission: Mission }>(`/api/missions/${missionId}`);
}

export async function submitMission(missionId: string, answer: string) {
  return request<{ correct: boolean; points: number; readOnly?: boolean }>(
    "/api/missions/submit",
    { method: "POST", body: JSON.stringify({ missionId, answer }) }
  );
}

// --- Game ---
export interface GameState {
  phase: string;
  startedAt: string | null;
  blipPhase: number | null;
  blipActive: boolean;
  lockdown: boolean;
}

export async function getGameState(): Promise<GameState> {
  return request<GameState>("/api/game/state", { skipAuth: true });
}

export async function getBlipPuzzle(): Promise<{ question: string } | null> {
  try {
    return await request<{ question: string }>("/api/game/blip-puzzle");
  } catch {
    return null;
  }
}

export async function startGame() {
  return request<{ message: string }>("/api/game/start", { method: "POST" });
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
  return request<StoneStatus>("/api/stones/stoneStatus");
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
    body: JSON.stringify({ targetId: targetTeamId, targetTeamId: targetTeamId }),
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
