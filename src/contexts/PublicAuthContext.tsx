import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { loadCartItemCount } from "@/lib/public-commerce";
import { loadUnreadNotificationCount } from "@/lib/public-store";

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
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<PublicUser, "fullName" | "email" | "phone">>) => void;
  refresh: () => void;
}

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

export function PublicAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => getStoredPublicUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const refreshCounts = useCallback(async (u: PublicUser | null) => {
    if (!u) {
      setUnreadCount(0);
      setCartCount(0);
      return;
    }
    const [unread, cart] = await Promise.all([
      loadUnreadNotificationCount(u.userId),
      loadCartItemCount(u.userId),
    ]);
    setUnreadCount(unread);
    setCartCount(cart);
  }, []);

  const refresh = useCallback(() => {
    const u = getStoredPublicUser();
    setUser(u);
    void refreshCounts(u);
  }, [refreshCounts]);

  useEffect(() => {
    void refreshCounts(user);
  }, [user, refreshCounts]);

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
        void refreshCounts(u);
        return true;
      },
      register: async (input) => {
        const u = await registerPublic(input);
        if (!u) return false;
        setUser(u);
        void refreshCounts(u);
        return true;
      },
      logout: () => {
        clearPublicSession();
        setUser(null);
        setUnreadCount(0);
        setCartCount(0);
      },
      updateProfile: (patch) => {
        void updatePublicProfile(patch).then((u) => {
          if (u) setUser(u);
        });
      },
    }),
    [user, unreadCount, cartCount, refresh, refreshCounts]
  );

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const ctx = useContext(PublicAuthContext);
  if (!ctx) throw new Error("usePublicAuth must be used within PublicAuthProvider");
  return ctx;
}
