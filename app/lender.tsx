import { useState } from "react";
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Linking, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── Lender Data — replace placeholders when ready ───────────────────────────
export const LENDERS = [
  {
    id: "1",
    name: "Lender 1",
    title: "Senior Mortgage Loan Officer",
    company: "Company Name Here",
    nmls: "NMLS #000001",
    tagline: "Short tagline goes here — one memorable line.",
    shortBio: "Short bio for the card goes here. Keep it to 1–2 sentences highlighting their specialty and experience.",
    fullBio: "Full biography goes here. This can be 2–3 paragraphs describing their background, experience, approach to lending, and what makes them a great fit for military and relocation buyers in the Dayton area. Add personal details, years of experience, loan volume, or anything that builds trust with potential borrowers.",
    phone: "(555) 555-0001",
    email: "lender1@example.com",
    website: "https://example.com",
    photo: null as string | null,     // replace with: "https://your-cdn.com/lender1.jpg"
    specialties: ["VA Loans", "Military Relocation", "First-Time Buyers"],
    loanTypes: [
      { label: "VA Purchase Loan",       note: "0% down, no PMI — veterans & active duty" },
      { label: "VA IRRRL Refinance",     note: "Streamlined refi for existing VA loans" },
      { label: "Conventional Loan",      note: "3–20% down, flexible terms" },
      { label: "FHA Loan",               note: "Low down payment, flexible credit" },
      { label: "Cash-Out Refinance",     note: "Access your equity for any purpose" },
    ],
    why: [
      { icon: "shield-checkmark-outline", title: "VA Specialist", body: "Add detail about their VA loan expertise and track record with military buyers." },
      { icon: "flash-outline",            title: "Fast Closings",  body: "Add detail about their turnaround speed and pre-approval process." },
      { icon: "people-outline",           title: "Local Expert",   body: "Add context about their knowledge of the Dayton/WPAFB market." },
    ],
  },
  {
    id: "2",
    name: "Lender 2",
    title: "Mortgage Loan Officer",
    company: "Company Name Here",
    nmls: "NMLS #000002",
    tagline: "Short tagline goes here — one memorable line.",
    shortBio: "Short bio for the card goes here. Keep it to 1–2 sentences highlighting their specialty and experience.",
    fullBio: "Full biography goes here. This can be 2–3 paragraphs describing their background, experience, approach to lending, and what makes them a great fit for military and relocation buyers in the Dayton area. Add personal details, years of experience, loan volume, or anything that builds trust with potential borrowers.",
    phone: "(555) 555-0002",
    email: "lender2@example.com",
    website: "https://example.com",
    photo: null as string | null,
    specialties: ["FHA Loans", "First-Time Buyers", "Renovation Loans"],
    loanTypes: [
      { label: "FHA Loan",               note: "Low down payment, flexible credit" },
      { label: "Conventional Loan",      note: "3–20% down, competitive rates" },
      { label: "VA Purchase Loan",       note: "0% down, no PMI" },
      { label: "203k Renovation Loan",   note: "Buy and renovate with one loan" },
      { label: "USDA Rural Loan",        note: "0% down for eligible Ohio properties" },
    ],
    why: [
      { icon: "home-outline",            title: "First-Time Buyer Focus", body: "Add detail about their approach to guiding first-time buyers through the process." },
      { icon: "construct-outline",       title: "Renovation Expert",      body: "Add context about their experience with 203k and renovation lending." },
      { icon: "ribbon-outline",          title: "Award / Credential",     body: "Add any relevant credentials, volume stats, or recognitions." },
    ],
  },
  {
    id: "3",
    name: "Lender 3",
    title: "Mortgage Loan Officer",
    company: "Company Name Here",
    nmls: "NMLS #000003",
    tagline: "Short tagline goes here — one memorable line.",
    shortBio: "Short bio for the card goes here. Keep it to 1–2 sentences highlighting their specialty and experience.",
    fullBio: "Full biography goes here. This can be 2–3 paragraphs describing their background, experience, approach to lending, and what makes them a great fit for military and relocation buyers in the Dayton area. Add personal details, years of experience, loan volume, or anything that builds trust with potential borrowers.",
    phone: "(555) 555-0003",
    email: "lender3@example.com",
    website: "https://example.com",
    photo: null as string | null,
    specialties: ["Conventional Loans", "Jumbo Loans", "Investment Property"],
    loanTypes: [
      { label: "Conventional Loan",      note: "3–20% down, competitive rates" },
      { label: "Jumbo Loan",             note: "Above conforming limits" },
      { label: "VA Purchase Loan",       note: "0% down, no PMI" },
      { label: "Investment Property",    note: "1–4 unit, portfolio & DSCR options" },
      { label: "Cash-Out Refinance",     note: "Access equity for any purpose" },
    ],
    why: [
      { icon: "trending-up-outline",     title: "Investment Specialist",  body: "Add detail about their experience with investment and multi-unit properties." },
      { icon: "business-outline",        title: "High-Volume Closer",     body: "Add context about their closing volume and experience with complex transactions." },
      { icon: "star-outline",            title: "Award / Credential",     body: "Add any relevant credentials, awards, or volume stats." },
    ],
  },
];

// ─── Specialty pill ────────────────────────────────────────────────────────────
function SpecialtyPill({ label }: { label: string }) {
  return (
    <View style={pill.wrap}>
      <Text style={pill.text}>{label}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  wrap: {
    backgroundColor: "#F0EAD6",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginRight: 6, marginBottom: 4,
  },
  text: { color: Colors.goldDark, fontSize: 11, fontWeight: "700" },
});

// ─── Single Lender Card ────────────────────────────────────────────────────────
function LenderCard({ lender }: { lender: typeof LENDERS[0] }) {
  const router = useRouter();
  return (
    <View style={card.wrap}>
      {/* Photo + name row */}
      <View style={card.topRow}>
        {lender.photo ? (
          <Image source={{ uri: lender.photo }} style={card.photo} />
        ) : (
          <View style={card.photoPlaceholder}>
            <Ionicons name="person" size={30} color={Colors.gold} />
          </View>
        )}
        <View style={card.nameBlock}>
          <Text style={card.name}>{lender.name}</Text>
          <Text style={card.title}>{lender.title}</Text>
          <Text style={card.company}>{lender.company}</Text>
          <Text style={card.nmls}>{lender.nmls}</Text>
        </View>
      </View>

      {/* Tagline */}
      <Text style={card.tagline}>"{lender.tagline}"</Text>

      {/* Short bio */}
      <Text style={card.bio}>{lender.shortBio}</Text>

      {/* Specialty pills */}
      <View style={card.pillRow}>
        {lender.specialties.map(s => <SpecialtyPill key={s} label={s} />)}
      </View>

      {/* Divider */}
      <View style={card.divider} />

      {/* Action buttons */}
      <View style={card.btnRow}>
        <TouchableOpacity
          style={card.profileBtn}
          onPress={() => router.push({ pathname: "/lender-detail" as any, params: { id: lender.id } })}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={15} color={Colors.black} />
          <Text style={card.profileBtnText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={card.websiteBtn}
          onPress={() => Linking.openURL(lender.website)}
          activeOpacity={0.85}
        >
          <Ionicons name="globe-outline" size={15} color={Colors.gold} />
          <Text style={card.websiteBtnText}>Website</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 14,
  },
  photo: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: Colors.goldDark,
  },
  photoPlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#1A1A1A",
    borderWidth: 2, borderColor: Colors.goldDark,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  nameBlock: { flex: 1, paddingTop: 4 },
  name:    { color: Colors.black, fontSize: 17, fontWeight: "800", marginBottom: 2 },
  title:   { color: Colors.gray, fontSize: 13, marginBottom: 1 },
  company: { color: Colors.gray, fontSize: 13, fontWeight: "600", marginBottom: 2 },
  nmls:    { color: "#AAAAAA", fontSize: 11 },

  tagline: {
    color: Colors.goldDark,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 19,
  },
  bio: {
    color: Colors.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row", flexWrap: "wrap",
    marginBottom: 14,
  },
  divider: {
    height: 1, backgroundColor: "#F0F0F0",
    marginBottom: 14,
  },
  btnRow: {
    flexDirection: "row", gap: 10,
  },
  profileBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 7,
    backgroundColor: Colors.gold,
    paddingVertical: 12, borderRadius: 10,
  },
  profileBtnText: { color: Colors.black, fontWeight: "800", fontSize: 13 },
  websiteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 7,
    borderWidth: 1.5, borderColor: Colors.gold,
    paddingVertical: 12, borderRadius: 10,
  },
  websiteBtnText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },
});

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function LenderScreen() {
  const router = useRouter();

  // Randomize order once on mount — new order every time screen opens
  const [shuffled] = useState<typeof LENDERS>(() =>
    [...LENDERS].sort(() => Math.random() - 0.5)
  );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="business-outline" size={20} color={Colors.gold} />
            <Text style={s.heroBadgeText}>PREFERRED LENDERS</Text>
          </View>
          <Text style={s.heroTitle}>Meet Chris's{"\n"}Trusted Lenders</Text>
          <Text style={s.heroBody}>
            These are lenders Chris has personally vetted and worked with
            in the Dayton market. All specialize in VA loans and military
            relocation — and they know how to close on time.
          </Text>
        </View>

        {/* ── Lender Cards (randomized) ─────────────────────────────────── */}
        <View style={s.cardsWrap}>
          {shuffled.map(lender => (
            <LenderCard key={lender.id} lender={lender} />
          ))}
        </View>

        {/* ── Disclosure ────────────────────────────────────────────────── */}
        <Text style={s.disclosure}>
          You are always free to work with any lender of your choice.
          Lender listings are rotated randomly and do not imply ranking or preference.
        </Text>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Not Sure Which Lender to Choose?</Text>
          <Text style={s.ctaBody}>
            Chris can help you match with the right lender for your specific
            situation — VA, FHA, conventional, or anything in between.
          </Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Text style={s.ctaBtnText}>Ask Chris</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>

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

  hero: {
    backgroundColor: Colors.black,
    paddingHorizontal: 22, paddingVertical: 28,
    borderBottomWidth: 3, borderBottomColor: Colors.gold,
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: Colors.gold, fontSize: 11, fontWeight: "800",
    letterSpacing: 2, textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.white, fontSize: 24, fontWeight: "900",
    lineHeight: 31, marginBottom: 12,
  },
  heroBody: {
    color: Colors.grayLight, fontSize: 14, lineHeight: 21,
  },

  cardsWrap: { paddingTop: 4 },

  disclosure: {
    color: Colors.gray, fontSize: 11, textAlign: "center",
    paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16,
    lineHeight: 16,
  },

  cta: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.black,
    borderRadius: 16, padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  ctaTitle: {
    color: Colors.white, fontWeight: "800", fontSize: 17,
    textAlign: "center", marginBottom: 8,
  },
  ctaBody: {
    color: Colors.gray, fontSize: 13,
    textAlign: "center", lineHeight: 19, marginBottom: 18,
  },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 28, borderRadius: 10,
  },
  ctaBtnText: { color: Colors.black, fontWeight: "800", fontSize: 14 },
});
