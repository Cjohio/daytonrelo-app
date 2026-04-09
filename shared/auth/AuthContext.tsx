import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { identify, reset } from "../analytics";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Persona = "military" | "relocation" | "discover";
export type MoveTimeline = "0-3 months" | "3-6 months" | "6-12 months" | "12+ months" | "just browsing";

export interface Profile {
  id:            string;
  full_name:     string;
  email:         string;
  phone:         string;
  move_timeline: MoveTimeline;
  persona:       Persona;
  created_at:    string;
}

export interface SavedItem {
  id:         string;
  user_id:    string;
  item_type:  "listing" | "page" | "tool";
  item_id:    string;
  title:      string;
  subtitle:   string | null;
  route:      string | null;
  metadata:   Record<string, any> | null;
  created_at: string;
}

interface AuthContextType {
  session:       Session | null;
  user:          User | null;
  profile:       Profile | null;
  savedItems:    SavedItem[];
  loading:       boolean;
  signOut:       () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveItem:      (item: Omit<SavedItem, "id" | "user_id" | "created_at">) => Promise<void>;
  unsaveItem:    (itemType: string, itemId: string) => Promise<void>;
  isSaved:       (itemType: string, itemId: string) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  session:        null,
  user:           null,
  profile:        null,
  savedItems:     [],
  loading:        true,
  signOut:        async () => {},
  refreshProfile: async () => {},
  saveItem:       async () => {},
  unsaveItem:     async () => {},
  isSaved:        () => false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,    setSession]    = useState<Session | null>(null);
  const [user,       setUser]       = useState<User | null>(null);
  const [profile,    setProfile]    = useState<Profile | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading,    setLoading]    = useState(true);

  // ── Fetch profile + saved items ──────────────────────────────────────────
  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }

  async function fetchSavedItems(userId: string) {
    const { data } = await supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setSavedItems(data as SavedItem[]);
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
      await fetchSavedItems(user.id);
    }
  }

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSavedItems(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSavedItems(session.user.id);
        identify(session.user.id, { email: session.user.email });
      } else {
        setProfile(null);
        setSavedItems([]);
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Save / Unsave ────────────────────────────────────────────────────────
  async function saveItem(item: Omit<SavedItem, "id" | "user_id" | "created_at">) {
    if (!user) return;
    const { data } = await supabase
      .from("saved_items")
      .insert({ ...item, user_id: user.id })
      .select()
      .single();
    if (data) setSavedItems(prev => [data as SavedItem, ...prev]);
  }

  async function unsaveItem(itemType: string, itemId: string) {
    if (!user) return;
    await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId);
    setSavedItems(prev =>
      prev.filter(i => !(i.item_type === itemType && i.item_id === itemId))
    );
  }

  function isSaved(itemType: string, itemId: string) {
    return savedItems.some(i => i.item_type === itemType && i.item_id === itemId);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, savedItems, loading,
      signOut, refreshProfile, saveItem, unsaveItem, isSaved,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
