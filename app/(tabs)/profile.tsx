import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../shared/auth/AuthContext";
import { Colors } from "../../shared/theme/colors";
import ChatFAB from "../../shared/components/ChatFAB";
import GlobalSearch from "../../shared/components/GlobalSearch";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";

// ─── Persona label map ────────────────────────────────────────────────────────
const PERSONA_LABEL: Record<string, string> = {
  military:   "Military / WPAFB",
  relocation: "Corporate Relo",
  discover:   "Dayton Resident",
};
const PERSONA_ICON: Record<string, string> = {
  military:   "shield-checkmark",
  relocation: "briefcase",
  discover:   "home",
};

// ─── Item type icon map ───────────────────────────────────────────────────────
const TYPE_ICON: Record<string, string> = {
  listing: "home",
  page:    "bookmark",
  tool:    "calculator",
};

export default function ProfileScreen() {
  const { user, profile, savedItems, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  // ── Not logged in — show signup prompt ──────────────────────────────────
  if (!user) {
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <TouchableOpacity style={s.homeBtn} onPress={() => router.replace("/(tabs)/" as any)}>
            <Ionicons name="home-outline" size={20} color={Colors.gold} />
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/logo-black.png")}
            style={s.headerLogo}
            resizeMode="contain"
          />
          <GlobalSearch />
        </View>
        <View style={s.guestContainer}>
          <View style={s.guestIconWrap}>
            <Ionicons name="person-circle-outline" size={72} color={Colors.gold} />
          </View>
          <Text style={s.guestTitle}>Save Your Search</Text>
          <Text style={s.guestSubtitle}>
            Create a free profile to save homes, bookmark tools, and get personalized recommendations from Chris.
          </Text>

          <View style={s.featureList}>
            {[
              { icon: "heart",           text: "Save listings you love" },
              { icon: "bookmark",        text: "Bookmark tools & neighborhoods" },
              { icon: "notifications",   text: "Get notified of price drops" },
              { icon: "person",          text: "Personalized Dayton tips" },
            ].map(f => (
              <View key={f.text} style={s.featureRow}>
                <View style={s.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={16} color={Colors.gold} />
                </View>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => router.push("/auth/signup" as any)}
          >
            <Text style={s.primaryBtnText}>Create Free Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.push("/auth/login" as any)}
          >
            <Text style={s.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <ChatFAB />
      </View>
    );
  }

  // ── Logged in — show profile + saved items ──────────────────────────────
  const pages    = savedItems.filter(i => i.item_type === "page");
  const tools    = savedItems.filter(i => i.item_type === "tool");
  const listings = savedItems.filter(i => i.item_type === "listing");

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel",   style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => {
        await signOut();
      }},
    ]);
  }

  return (
    <View style={s.flex}>
      {/* Header */}
      <View style={s.header}>
        <Image
          source={require("../../assets/images/logo-black.png")}
          style={s.headerLogo}
          resizeMode="contain"
        />
        <GlobalSearch />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <Ionicons name="person" size={30} color={Colors.gold} />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{profile?.full_name ?? "User"}</Text>
            <Text style={s.profileEmail}>{profile?.email ?? user.email}</Text>
            {profile?.phone ? (
              <Text style={s.profilePhone}>{profile.phone}</Text>
            ) : null}
          </View>
          <View style={s.personaBadge}>
            <Ionicons
              name={(PERSONA_ICON[profile?.persona ?? "general"]) as any}
              size={14}
              color={Colors.gold}
            />
            <Text style={s.personaBadgeText}>
              {PERSONA_LABEL[profile?.persona ?? "general"]}
            </Text>
          </View>
        </View>

        {/* Move timeline */}
        {profile?.move_timeline && (
          <View style={s.timelineRow}>
            <Ionicons name="calendar-outline" size={15} color={Colors.gray} />
            <Text style={s.timelineText}>
              Moving timeline: <Text style={s.timelineBold}>{profile.move_timeline}</Text>
            </Text>
          </View>
        )}

        {/* Saved sections */}
        {savedItems.length === 0 ? (
          <View style={s.emptyWrap}>
            <Ionicons name="bookmark-outline" size={40} color={Colors.border} />
            <Text style={s.emptyTitle}>No saves yet</Text>
            <Text style={s.emptySubtitle}>
              Tap the bookmark icon on any page or tool to save it here.
            </Text>
          </View>
        ) : (
          <>
            {listings.length > 0 && (
              <SavedSection title="Saved Homes" icon="home" items={listings} />
            )}
            {pages.length > 0 && (
              <SavedSection title="Saved Pages" icon="bookmark" items={pages} />
            )}
            {tools.length > 0 && (
              <SavedSection title="Saved Tools" icon="calculator" items={tools} />
            )}
          </>
        )}

        {/* Actions */}
        <View style={s.actionsSection}>
          <TouchableOpacity
            style={s.actionRow}
            onPress={() => router.push("/edit-profile" as any)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.black} />
            <Text style={s.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity style={s.actionRow} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text style={[s.actionText, { color: "#E53935" }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Contact Chris — prominent CTA */}
        <View style={s.ctaCard}>
          <View style={s.ctaCardHeader}>
            <Ionicons name="person-circle" size={28} color={Colors.gold} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.ctaTitle}>Ready to Find Your Home?</Text>
              <Text style={s.ctaSub}>Chris Jurgens · Dayton Relocation Specialist</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.ctaPrimaryBtn}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-outline" size={16} color={Colors.black} />
            <Text style={s.ctaPrimaryBtnText}>Send a Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.ctaSecondaryBtn}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="call-outline" size={16} color={Colors.gold} />
            <Text style={s.ctaSecondaryBtnText}>Call or Text Chris</Text>
          </TouchableOpacity>
        </View>

        {/* Legal footer */}
        <View style={s.legalFooter}>
          <TouchableOpacity onPress={() => router.push("/privacy-policy" as any)}>
            <Text style={s.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={s.legalDot}>·</Text>
          <Text style={s.legalText}>© {new Date().getFullYear()} Chris Jurgens · Dayton Relo</Text>
        </View>

      </ScrollView>
      <ChatFAB />
    </View>
  );
}

// ─── Saved section component ──────────────────────────────────────────────────
function SavedSection({
  title, icon, items,
}: {
  title: string;
  icon: string;
  items: ReturnType<typeof useAuth>["savedItems"];
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name={icon as any} size={16} color={Colors.gold} />
        <Text style={s.sectionTitle}>{title}</Text>
        <Text style={s.sectionCount}>{items.length}</Text>
      </View>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={s.savedRow}
          onPress={() => {
            if (item.item_type === "listing") {
              router.push({ pathname: "/listing" as any, params: { mlsId: item.item_id } });
            } else if (item.route) {
              router.push(item.route as any);
            }
          }}
        >
          <View style={s.savedIconWrap}>
            <Ionicons
              name={(TYPE_ICON[item.item_type] ?? "bookmark") as any}
              size={15}
              color={Colors.gold}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.savedTitle} numberOfLines={1}>{item.title}</Text>
            {item.subtitle ? (
              <Text style={s.savedSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={14} color={Colors.gray} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Header
  header: {
    backgroundColor: Colors.black,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLogo: {
    width: 160,
    height: 48,
    flex: 1,
  },
  homeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { paddingBottom: 120 },

  // Guest
  guestContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  guestIconWrap: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF9E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  featureList: { width: "100%", gap: 12, marginBottom: 28 },
  featureRow:  { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIconWrap: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { fontSize: 14, color: Colors.black, fontWeight: "500" },
  primaryBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.black,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
  },

  // Profile card
  profileCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.black,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName:  { fontSize: 16, fontWeight: "700", color: Colors.white },
  profileEmail: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  profilePhone: { fontSize: 12, color: Colors.gray, marginTop: 1 },
  personaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  personaBadgeText: { fontSize: 10, color: Colors.gold, fontWeight: "600" },

  // Timeline
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  timelineText: { fontSize: 13, color: Colors.gray },
  timelineBold: { fontWeight: "700", color: Colors.black },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle:    { fontSize: 16, fontWeight: "700", color: Colors.black },
  emptySubtitle: { fontSize: 13, color: Colors.gray, textAlign: "center", lineHeight: 19 },

  // Saved section
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.black, flex: 1 },
  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  savedIconWrap: {
    width: 32, height: 32,
    borderRadius: 8,
    backgroundColor: "#FFF9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  savedTitle:    { fontSize: 14, fontWeight: "600", color: Colors.black },
  savedSubtitle: { fontSize: 12, color: Colors.gray, marginTop: 2 },

  // Actions
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: Colors.white,
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.black },
  divider:    { height: 1, backgroundColor: Colors.border },

  // CTA card
  ctaCard: {
    margin: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  ctaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ctaTitle: { fontSize: 15, fontWeight: "800", color: Colors.white },
  ctaSub:   { fontSize: 12, color: Colors.gray, marginTop: 2 },
  ctaPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  ctaPrimaryBtnText: { fontSize: 15, fontWeight: "800", color: Colors.black },
  ctaSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
  },
  ctaSecondaryBtnText: { fontSize: 14, fontWeight: "700", color: Colors.gold },

  legalFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 20, paddingHorizontal: 20,
  },
  legalLink: { color: Colors.gold, fontSize: 11, fontWeight: "600" },
  legalDot:  { color: Colors.grayLight, fontSize: 11 },
  legalText: { color: Colors.grayLight, fontSize: 11 },
});
