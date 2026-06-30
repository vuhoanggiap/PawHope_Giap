import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { USE_MOCK } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-session";
import {  clearPublicSession,  getStoredPublicUser,  looksLikeBrokenEncoding,  loginPublic, 
  registerPublic, updatePublicProfile,  type PublicUser } from "@/lib/public-auth";
import { loadCartItemCount } from "@/lib/public-commerce";
import { loadUnreadNotificationCount } from "@/lib/public-store";
import { updateUser } from "@/lib/api/users-api"; 

interface PublicAuthContextValue {
  user: PublicUser | null;
  unreadCount: number;
  cartCount: number;
  login: (identifier: string, password: string) => Promise<boolean>;
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
  const [user, setUser] = useState<PublicUser | null>(() => {
    const stored = getStoredPublicUser();
    if (!USE_MOCK && stored && !getAuthToken()) {
      clearPublicSession();
      return null;
    }
    if (
      stored &&
      (looksLikeBrokenEncoding(stored.fullName) ||
        looksLikeBrokenEncoding(stored.username) ||
        looksLikeBrokenEncoding(stored.email))
    ) {
      clearPublicSession();
      return null;
    }
    return stored;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const refreshCounts = useCallback(async (u: PublicUser | null) => {
    if (!u?.userId) {
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
      login: async (identifier, password) => {
        const u = await loginPublic(identifier, password);

        setUser(u);
        void refreshCounts(u);

        return true;
      },
      register: async (input) => {
        const isSuccess = await registerPublic(input);
        if (!isSuccess) return false;
        return true;
      },
      logout: () => {
        clearPublicSession();
        setUser(null);
        setUnreadCount(0);
        setCartCount(0);
      },

      updateProfile: (patch) => {
        if (!user?.userId) return;

        void updateUser(user.userId, {
          username: user.username, 
          fullName: patch.fullName ?? user.fullName,
          email: patch.email ?? user.email,
          phone: patch.phone ?? user.phone,
        })
          .then((updatedUser) => {
            if (updatedUser) {
              setUser(updatedUser as any);
              updatePublicProfile(patch);
              void refreshCounts(updatedUser as any);
            }
          })
          .catch((err) => {
            console.error("Failed to update real database profile:", err);
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