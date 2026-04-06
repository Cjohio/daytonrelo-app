import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── LENDER INFO — fill these in when ready ──────────────────────────────────
const LENDER = {
  name:    "Your Lender Name",          // e.g. "Mike Smith"
  title:   "Mortgage Loan Officer",
  company: "Your Company Name",         // e.g. "First Federal Savings"
  tagline: "Your tagline here",         // e.g. "Helping Dayton families close on time since 2010"
  phone:   "(555) 555-5555",
  email:   "lender@example.com",
  website: "https://example.com",
  nmls:    "NMLS #000000",
  photo:   null as string | null,       // swap with lender headshot URL when ready
};

// ─── Why this lender ─────────────────────────────────────────────────────────
const WHY_ITEMS = [
  {
    icon:  "shield-checkmark-outline",
    title: "Local Dayton Expert",
    body:  "Add a reason why this lender knows the Dayton market and what makes them stand out for local buyers.",
  },
  {
    icon:  "flash-outline",
    title: "Fast Pre-Approvals",
    body:  "Add detail about their turnaround time and how quickly they can get buyers pre-approved and ready to make offers.",
  },
  {
    icon:  "people-outline",
    title: "VA & Military Specialist",
    body:  "Add context about their experience with VA loans and working with WPAFB service members and veterans.",
  },
  {
    icon:  "ribbon-outline",
    title: "Award / Credential",
    body:  "Add any relevant credentials, awards, or volume stats (e.g. top lender in Montgomery County).",
  },
];

// ─── Loan types ───────────────────────────────────────────────────────────────
const LOAN_TYPES = [
  { label: "VA Purchase Loan",           note: "0% down, no PMI — for eligible veterans & active duty" },
  { label: "Conventional Loan",          note: "3–20% down, flexible terms, competitive rates" },
  { label: "FHA Loan",                   note: "Low down payment, flexible credit requirements" },
  { label: "USDA Rural Development",     note: "0% down for eligible rural/suburban Ohio properties" },
  { label: "Jumbo Loan",                 note: "For homes above conforming loan limits" },
  { label: "VA IRRRL Refinance",         note: "Streamlined refi for existing VA loans" },
  { label: "Cash-Out Refinance",         note: "Access your home's equity for improvements or debt" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function LenderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Hero card ────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.photoPlaceholder}>
            <Ionicons name="person" size={44} color={Colors.gold} />
          </View>

          <Text style={s.name}>{LENDER.name}</Text>
          <Text style={s.titleText}>{LENDER.title} · {LENDER.company}</Text>
          <Text style={s.nmls}>{LENDER.nmls}</Text>
          <Text style={s.tagline}>{LENDER.tagline}</Text>

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
              onPress={() => Linking.openURL(`sms:${LENDER.phone.replace(/\D/g, "")}`)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={Colors.black} />
              <Text style={s.contactBtnText}>Text</Text>
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
          <Text style={s.sectionTitle}>Loan Products Offered</Text>
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

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
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

        <Text style={s.disclosure}>
          You are always free to work with any lender of your choice.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.black },
  content: { paddingBottom: 24 },

  hero: {
    backgroundColor: Colors.black,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
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
  name:      { color: Colors.white, fontSize: 22, fontWeight: "800", marginBottom: 4 },
  titleText: { color: Colors.grayLight, fontSize: 13, marginBottom: 4 },
  nmls:      { color: "#555", fontSize: 11, marginBottom: 10 },
  tagline:   { color: Colors.gold, fontSize: 13, fontStyle: "italic", textAlign: "center", marginBottom: 24 },

  contactRow: { flexDirection: "row", gap: 10 },
  contactBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold, paddingVertical: 11,
    paddingHorizontal: 18, borderRadius: 10,
  },
  contactBtnText:        { color: Colors.black, fontWeight: "700", fontSize: 13 },
  contactBtnOutline:     { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.gold },
  contactBtnOutlineText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  section:      { paddingHorizontal: 20, paddingTop: 20, backgroundColor: Colors.white },
  sectionTitle: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
    paddingLeft: 10, marginBottom: 18, marginTop: 8,
  },

  whyRow:  { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
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
  ctaPrimaryText:   { color: Colors.black, fontWeight: "800", fontSize: 14 },
  ctaSecondary: {
    paddingVertical: 12, width: "100%", alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.gold, borderRadius: 10,
  },
  ctaSecondaryText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },

  disclosure: {
    color: Colors.gray, fontSize: 11, textAlign: "center",
    paddingHorizontal: 24, paddingTop: 8, lineHeight: 16,
  },
});
