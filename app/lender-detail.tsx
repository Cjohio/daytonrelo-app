import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Linking, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import { LENDERS } from "./lender";

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function LenderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const lender = LENDERS.find(l => l.id === id) ?? LENDERS[0];

  function dialPhone() {
    Linking.openURL(`tel:${lender.phone.replace(/\D/g, "")}`);
  }
  function sendText() {
    Linking.openURL(`sms:${lender.phone.replace(/\D/g, "")}`);
  }
  function sendEmail() {
    Linking.openURL(`mailto:${lender.email}`);
  }
  function openWebsite() {
    Linking.openURL(lender.website);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          {lender.photo ? (
            <Image source={{ uri: lender.photo }} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Ionicons name="person" size={52} color={Colors.gold} />
            </View>
          )}

          <Text style={s.name}>{lender.name}</Text>
          <Text style={s.titleText}>{lender.title}</Text>
          <Text style={s.company}>{lender.company}</Text>
          <Text style={s.nmls}>{lender.nmls}</Text>
          <Text style={s.tagline}>"{lender.tagline}"</Text>

          {/* Contact buttons */}
          <View style={s.contactRow}>
            <TouchableOpacity style={s.contactBtn} onPress={dialPhone} activeOpacity={0.85}>
              <Ionicons name="call-outline" size={16} color={Colors.black} />
              <Text style={s.contactBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.contactBtn} onPress={sendText} activeOpacity={0.85}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.black} />
              <Text style={s.contactBtnText}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.contactBtn, s.contactOutline]} onPress={sendEmail} activeOpacity={0.85}>
              <Ionicons name="mail-outline" size={16} color={Colors.gold} />
              <Text style={s.contactOutlineText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.contactBtn, s.contactOutline]} onPress={openWebsite} activeOpacity={0.85}>
              <Ionicons name="globe-outline" size={16} color={Colors.gold} />
              <Text style={s.contactOutlineText}>Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Specialties ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Specialties</Text>
          <View style={s.pillRow}>
            {lender.specialties.map(sp => (
              <View key={sp} style={s.pill}>
                <Text style={s.pillText}>{sp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Full Bio ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About {lender.name}</Text>
          <Text style={s.bioText}>{lender.fullBio}</Text>
        </View>

        {/* ── Why this lender ───────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Why {lender.name}?</Text>
          {lender.why.map(({ icon, title, body }) => (
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

        {/* ── Loan Types ────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Loan Products Offered</Text>
          {lender.loanTypes.map(({ label, note }) => (
            <View key={label} style={s.loanRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.gold} />
              <View style={s.loanText}>
                <Text style={s.loanLabel}>{label}</Text>
                <Text style={s.loanNote}>{note}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── CTAs ──────────────────────────────────────────────────────── */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Ready to Get Pre-Approved?</Text>
          <Text style={s.ctaBody}>
            Reach out to {lender.name} directly, or connect through Chris
            and he'll make the introduction.
          </Text>
          <TouchableOpacity
            style={s.ctaPrimary}
            onPress={dialPhone}
            activeOpacity={0.85}
          >
            <Ionicons name="call-outline" size={16} color={Colors.black} />
            <Text style={s.ctaPrimaryText}>Call {lender.name}</Text>
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

        <View style={{ height: 80 }} />
      </ScrollView>

      <ChatFAB extraBottom={64} />
      <AppTabBar />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.black },
  content: { paddingBottom: 24 },

  // Hero
  hero: {
    backgroundColor: Colors.black,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomWidth: 3,
    borderBottomColor: Colors.gold,
  },
  photo: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: Colors.goldDark,
    marginBottom: 18,
  },
  photoPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "#1A1A1A",
    borderWidth: 3, borderColor: Colors.goldDark,
    alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  name:      { color: Colors.white, fontSize: 24, fontWeight: "900", marginBottom: 4, textAlign: "center" },
  titleText: { color: Colors.grayLight, fontSize: 14, marginBottom: 2, textAlign: "center" },
  company:   { color: Colors.grayLight, fontSize: 14, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  nmls:      { color: "#555", fontSize: 12, marginBottom: 10 },
  tagline:   { color: Colors.gold, fontSize: 13, fontStyle: "italic", textAlign: "center", marginBottom: 24, lineHeight: 19, paddingHorizontal: 10 },

  contactRow: {
    flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center",
  },
  contactBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
  },
  contactBtnText: { color: Colors.black, fontWeight: "700", fontSize: 13 },
  contactOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  contactOutlineText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  // Sections
  section: {
    paddingHorizontal: 20, paddingTop: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
    paddingLeft: 10, marginBottom: 14,
  },

  // Specialties
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: {
    backgroundColor: "#F0EAD6",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
  },
  pillText: { color: Colors.goldDark, fontSize: 12, fontWeight: "700" },

  // Bio
  bioText: { color: Colors.gray, fontSize: 14, lineHeight: 22 },

  // Why
  whyRow:  { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  whyIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.black,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  whyText:  { flex: 1 },
  whyTitle: { color: Colors.black, fontWeight: "700", fontSize: 14, marginBottom: 3 },
  whyBody:  { color: Colors.gray, fontSize: 13, lineHeight: 19 },

  // Loan types
  loanRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  loanText:  { flex: 1 },
  loanLabel: { color: Colors.black, fontWeight: "600", fontSize: 14, marginBottom: 2 },
  loanNote:  { color: Colors.gray, fontSize: 12 },

  // CTA
  cta: {
    margin: 20, backgroundColor: Colors.black,
    borderRadius: 16, padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  ctaTitle: {
    color: Colors.white, fontWeight: "800", fontSize: 17,
    textAlign: "center", marginBottom: 8,
  },
  ctaBody: {
    color: Colors.gray, fontSize: 13,
    textAlign: "center", lineHeight: 19, marginBottom: 20,
  },
  ctaPrimary: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 13, paddingHorizontal: 28,
    borderRadius: 10, marginBottom: 12,
    width: "100%", justifyContent: "center",
  },
  ctaPrimaryText:   { color: Colors.black, fontWeight: "800", fontSize: 14 },
  ctaSecondary: {
    paddingVertical: 12, width: "100%",
    alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.gold,
    borderRadius: 10,
  },
  ctaSecondaryText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },

  disclosure: {
    color: Colors.gray, fontSize: 11, textAlign: "center",
    paddingHorizontal: 24, lineHeight: 16,
  },
});
