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
  login: (email: string, password: string) => Promise<PublicUser | null>;
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
    if (!u || !u.userId) {
      setUnreadCount(0);
      setCartCount(0);
      return;
    }

    try {
      const [unread, cart] = await Promise.all([
        loadUnreadNotificationCount(u.userId),
        loadCartItemCount(u.userId),
      ]);

      setUnreadCount(unread);
      setCartCount(cart);
    } catch {
      setUnreadCount(0);
      setCartCount(0);
    }
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

      login: async (email, password) => {
        const u = await loginPublic(email, password);

        if (!u) return null;

        setUser(u);
        void refreshCounts(u);

        return u;
      },

      register: async (input) => {
        // Gọi hàm đăng ký từ lib/public-auth
        const u = await registerPublic(input);

        // Nếu đăng ký thất bại, trả về false
        if (!u) return false;

        // --- XÓA CÁC DÒNG NÀY ĐI ---
        // setUser(u); 
        // void refreshCounts(u);
        // ---------------------------

        // Chỉ trả về true, không set user vào state
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
          if (u) {
            setUser(u);
            void refreshCounts(u);
          }
        });
      },
    }),
    [user, unreadCount, cartCount, refresh, refreshCounts]
  );

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const ctx = useContext(PublicAuthContext);

  if (!ctx) {
    throw new Error("usePublicAuth must be used within PublicAuthProvider");
  }

  return ctx;
}