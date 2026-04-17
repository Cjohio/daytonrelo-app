import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── Replace with lender's YouTube video ID ──────────────────────────────────
// e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ the ID is "dQw4w9WgXcQ"
const LENDER_VIDEO_ID = "YOUR_VIDEO_ID_HERE";

// ─── LENDER INFO — fill these in ─────────────────────────────────────────────
const LENDER = {
  name:        "Your Lender Name",           // e.g. "First Federal Savings"
  title:       "VA Loan Specialist",
  company:     "Your Company Name",
  tagline:     "Your tagline here",          // e.g. "Helping WPAFB families close on time since 2005"
  phone:       "(555) 555-5555",
  email:       "lender@example.com",
  website:     "https://example.com",
  nmls:        "NMLS #000000",
  photo:       null as string | null,        // swap with lender headshot URL when ready
};

const WHY_ITEMS = [
  {
    icon: "shield-checkmark-outline",
    title: "VA Loan Expert",
    body: "Add a specific reason why this lender specializes in VA loans and what sets them apart.",
  },
  {
    icon: "flash-outline",
    title: "Fast Pre-Approvals",
    body: "Add detail about turnaround time or PCS-friendly timeline flexibility.",
  },
  {
    icon: "people-outline",
    title: "Military Family Focus",
    body: "Add context about their experience working with active duty, veterans, or WPAFB specifically.",
  },
  {
    icon: "ribbon-outline",
    title: "Award / Credential",
    body: "Add any relevant credentials, awards, or volume stats (e.g. top VA lender in Ohio).",
  },
];

const LOAN_TYPES = [
  { label: "VA Purchase Loan",        note: "0% down, no PMI, competitive rates" },
  { label: "VA IRRRL Refinance",      note: "Streamline refi for existing VA loans" },
  { label: "VA Cash-Out Refinance",   note: "Access equity for home improvements" },
  { label: "VA Jumbo Loan",           note: "For homes above conforming loan limits" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function VALenderScreen() {
  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Hero card ────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          {/* Photo placeholder */}
          <View style={s.photoPlaceholder}>
            <Ionicons name="person" size={44} color={Colors.gold} />
          </View>

          <Text style={s.name}>{LENDER.name}</Text>
          <Text style={s.title}>{LENDER.title} · {LENDER.company}</Text>
          <Text style={s.nmls}>{LENDER.nmls}</Text>
          <Text style={s.tagline}>{LENDER.tagline}</Text>

          {/* Contact buttons */}
          <View style={s.contactRow}>
            <TouchableOpacity
              style={s.contactBtn}
              onPress={() => Linking.openURL(`tel:${LENDER.phone.replace(/\D/g, "")}`)}
            >
              <Ionicons name="call-outline" size={16} color={Colors.black} />
              <Text style={s.contactBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.contactBtn}
              onPress={() => Linking.openURL(`mailto:${LENDER.email}`)}
            >
              <Ionicons name="mail-outline" size={16} color={Colors.black} />
              <Text style={s.contactBtnText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.contactBtn, s.contactBtnOutline]}
              onPress={() => Linking.openURL(LENDER.website)}
            >
              <Ionicons name="globe-outline" size={16} color={Colors.gold} />
              <Text style={s.contactBtnOutlineText}>Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Video intro ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Meet {LENDER.name}</Text>
          <TouchableOpacity
            style={s.videoCard}
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${LENDER_VIDEO_ID}`)}
            activeOpacity={0.88}
          >
            <Image
              source={{ uri: `https://img.youtube.com/vi/${LENDER_VIDEO_ID}/hqdefault.jpg` }}
              style={s.videoThumb}
              resizeMode="cover"
            />
            <View style={s.videoOverlay}>
              <View style={s.playBtn}>
                <Ionicons name="play" size={28} color={Colors.black} />
              </View>
            </View>
            <View style={s.videoFooter}>
              <Ionicons name="logo-youtube" size={16} color="#FF0000" />
              <Text style={s.videoFooterText}>Watch Introduction</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Why this lender ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Why {LENDER.name}?</Text>
          {WHY_ITEMS.map(({ icon, title, body }) => (
            <View key={title} style={s.whyRow}>
              <View style={s.whyIcon}>
                <Ionicons name={icon as any} size={18} color={Colors.gold} />
              </View>
              <View style={s.whyText}>
                <Text style={s.whyTitle}>{title}</Text>
                <Text style={s.whyBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Loan types ───────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>VA Loan Products</Text>
          {LOAN_TYPES.map(({ label, note }) => (
            <View key={label} style={s.loanRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.gold} />
              <View style={s.loanText}>
                <Text style={s.loanLabel}>{label}</Text>
                <Text style={s.loanNote}>{note}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Get started CTA ──────────────────────────────────────────────── */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Ready to Get Pre-Approved?</Text>
          <Text style={s.ctaBody}>
            Reach out to {LENDER.name} directly, or connect through Chris and we'll make the introduction.
          </Text>
          <TouchableOpacity
            style={s.ctaPrimary}
            onPress={() => Linking.openURL(`tel:${LENDER.phone.replace(/\D/g, "")}`)}
            activeOpacity={0.85}
          >
            <Ionicons name="call-outline" size={16} color={Colors.black} />
            <Text style={s.ctaPrimaryText}>Call {LENDER.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.ctaSecondary}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Text style={s.ctaSecondaryText}>Connect Through Chris</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 24 },

  hero: {
    backgroundColor: Colors.black,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    borderBottomWidth: 3,
    borderBottomColor: Colors.gold,
  },
  photoPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#1A1A1A",
    borderWidth: 2, borderColor: Colors.goldDark,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  name:    { color: Colors.white, fontSize: 22, fontWeight: "800", marginBottom: 4 },
  title:   { color: Colors.grayLight, fontSize: 13, marginBottom: 4 },
  nmls:    { color: "#555", fontSize: 11, marginBottom: 10 },
  tagline: { color: Colors.gold, fontSize: 13, fontStyle: "italic", textAlign: "center", marginBottom: 24 },

  contactRow: { flexDirection: "row", gap: 10 },
  contactBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold, paddingVertical: 11,
    paddingHorizontal: 18, borderRadius: 10,
  },
  contactBtnText: { color: Colors.black, fontWeight: "700", fontSize: 13 },
  contactBtnOutline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.gold },
  contactBtnOutlineText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionTitle: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
    paddingLeft: 10, marginBottom: 18,
  },

  // ── YouTube video ─────────────────────────────────────────────────────────
  videoCard: {
    borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.black,
  },
  videoThumb: { width: "100%", height: 200 },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    bottom: 44,
  },
  playBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  videoFooter: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.black,
  },
  videoFooterText: { color: Colors.white, fontSize: 13, fontWeight: "600" },

  whyRow: { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  whyIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.black,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  whyText:  { flex: 1 },
  whyTitle: { color: Colors.black, fontWeight: "700", fontSize: 14, marginBottom: 3 },
  whyBody:  { color: Colors.gray, fontSize: 13, lineHeight: 19 },

  loanRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  loanText:  { flex: 1 },
  loanLabel: { color: Colors.black, fontWeight: "600", fontSize: 14, marginBottom: 2 },
  loanNote:  { color: Colors.gray, fontSize: 12 },

  cta: {
    margin: 20, backgroundColor: Colors.black,
    borderRadius: 16, padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  ctaTitle: { color: Colors.white, fontWeight: "800", fontSize: 17, textAlign: "center", marginBottom: 8 },
  ctaBody:  { color: Colors.gray, fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 20 },
  ctaPrimary: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 28, borderRadius: 10, marginBottom: 12, width: "100%",
    justifyContent: "center",
  },
  ctaPrimaryText: { color: Colors.black, fontWeight: "800", fontSize: 14 },
  ctaSecondary: {
    paddingVertical: 12, width: "100%", alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.gold, borderRadius: 10,
  },
  ctaSecondaryText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
});
