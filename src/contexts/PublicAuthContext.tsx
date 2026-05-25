import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearPublicSession,
  getStoredPublicUser,
  loginPublic,
  registerPublic,
  updatePublicProfile,
  type PublicUser,
} from "@/lib/public-auth";
import { getUnreadNotificationCount } from "@/lib/public-store";
import { getCartItemCount } from "@/lib/public-commerce";

interface PublicAuthContextValue {
  user: PublicUser | null;
  unreadCount: number;
  cartCount: number;
  login: (username: string, password: string) => boolean;
  register: (input: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone?: string;
  }) => boolean;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<PublicUser, "fullName" | "email" | "phone">>) => void;
  refresh: () => void;
}

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

export function PublicAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => getStoredPublicUser());
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setUser(getStoredPublicUser());
    setTick((t) => t + 1);
  }, []);

  const unreadCount = useMemo(() => {
    void tick;
    return user ? getUnreadNotificationCount(user.userId) : 0;
  }, [user, tick]);

  const cartCount = useMemo(() => {
    void tick;
    return user ? getCartItemCount(user.userId) : 0;
  }, [user, tick]);

  const value = useMemo<PublicAuthContextValue>(
    () => ({
      user,
      unreadCount,
      cartCount,
      refresh,
      login: (username, password) => {
        const u = loginPublic(username, password);
        if (!u) return false;
        setUser(u);
        setTick((t) => t + 1);
        return true;
      },
      register: (input) => {
        const u = registerPublic(input);
        if (!u) return false;
        setUser(u);
        setTick((t) => t + 1);
        return true;
      },
      logout: () => {
        clearPublicSession();
        setUser(null);
      },
      updateProfile: (patch) => {
        const u = updatePublicProfile(patch);
        if (u) setUser(u);
      },
    }),
    [user, unreadCount, cartCount, refresh]
  );

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const ctx = useContext(PublicAuthContext);
  if (!ctx) throw new Error("usePublicAuth must be used within PublicAuthProvider");
  return ctx;
}
