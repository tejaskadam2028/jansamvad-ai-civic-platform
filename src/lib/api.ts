import type { Role, User } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'jansamvad_jwt_token_v1';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface AuthSignupRequest {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
}

export interface AuthSigninRequest {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  ward: string | null;
  department: string | null;
  mobileNumber: string;
}

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  ward: string | null;
  department: string | null;
  createdAt: string;
}

function mapRole(role: string): Role {
  const r = role.toUpperCase();
  if (r === 'CITIZEN') return 'citizen';
  if (r === 'MUNICIPAL_AUTHORITY') return 'authority';
  if (r === 'FIELD_WORKFORCE') return 'workforce';
  if (r === 'INFLUENCER_REPORTER' || r === 'INFLUENCER') return 'influencer';
  return 'citizen';
}

function authResponseToUser(resp: AuthResponseDto): User {
  return {
    id: resp.userId,
    name: resp.fullName,
    email: resp.email,
    role: mapRole(resp.role),
    phone: resp.mobileNumber,
    area: resp.ward || 'Pimpri-Chinchwad',
  };
}

function userResponseToUser(resp: UserResponseDto): User {
  return {
    id: String(resp.id),
    name: resp.fullName,
    email: resp.email,
    role: mapRole(resp.role),
    phone: resp.mobileNumber,
    area: resp.ward || 'Pimpri-Chinchwad',
  };
}

export async function apiSignup(req: AuthSignupRequest): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await handleResponse<AuthResponseDto>(res);
  saveToken(data.token);
  return { token: data.token, user: authResponseToUser(data) };
}

export async function apiSignin(req: AuthSigninRequest): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await handleResponse<AuthResponseDto>(res);
  saveToken(data.token);
  return { token: data.token, user: authResponseToUser(data) };
}

export async function apiGetMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<UserResponseDto>(res);
  return userResponseToUser(data);
}

export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'OPTIONS',
    });
    return res.ok || res.status === 401 || res.status === 400;
  } catch {
    return false;
  }
}
