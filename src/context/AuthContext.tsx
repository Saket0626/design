import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedDemoData } from "../lib/seed";
import { storage, uid } from "../lib/storage";
import type { Specialty, User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
  }) => { ok: boolean; error?: string };
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "bio" | "specialties" | "avatarUrl" | "displayName">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoData();
    const sessionId = storage.getSession();
    if (sessionId) {
      const found = storage.getUsers().find((u) => u.id === sessionId);
      setUser(found ?? null);
    }
    setLoading(false);
  }, []);

  const signUp = useCallback(
    (data: {
      username: string;
      displayName: string;
      email: string;
      password: string;
    }) => {
      const users = storage.getUsers();
      if (users.some((u) => u.email === data.email)) {
        return { ok: false, error: "Email already registered" };
      }
      if (users.some((u) => u.username === data.username)) {
        return { ok: false, error: "Username taken" };
      }
      const newUser: User = {
        id: uid(),
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        password: data.password,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        bio: "",
        specialties: [],
        createdAt: new Date().toISOString(),
      };
      storage.saveUsers([...users, newUser]);
      storage.setSession(newUser.id);
      setUser(newUser);
      return { ok: true };
    },
    []
  );

  const signIn = useCallback((email: string, password: string) => {
    const found = storage
      .getUsers()
      .find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: "Invalid email or password" };
    storage.setSession(found.id);
    setUser(found);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    storage.setSession(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, "bio" | "specialties" | "avatarUrl" | "displayName">>) => {
      if (!user) return;
      const users = storage.getUsers();
      const updated = { ...user, ...patch };
      storage.saveUsers(users.map((u) => (u.id === user.id ? updated : u)));
      setUser(updated);
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signOut, updateProfile }),
    [user, loading, signUp, signIn, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { Specialty };
