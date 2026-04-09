import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert, Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../shared/theme/colors";
import type { Persona, MoveTimeline } from "../../shared/auth/AuthContext";
import { setPersona } from "../../shared/persona";
import { signInWithGoogle } from "../../shared/auth/useGoogleAuth";
import { track } from "../../shared/analytics";

// ─── Lead capture options ─────────────────────────────────────────────────────
const TIMELINES: { label: string; value: MoveTimeline }[] = [
  { label: "I already live here", value: "just browsing" },
  { label: "0 – 3 months",        value: "0-3 months" },
  { label: "3 – 6 months",        value: "3-6 months" },
  { label: "6 – 12 months",       value: "6-12 months" },
  { label: "12+ months",          value: "12+ months" },
];

const PERSONAS: { label: string; sub: string; icon: string; value: Persona }[] = [
  { label: "Military / WPAFB", sub: "PCS to Dayton · VA loan · BAH",      icon: "shield-checkmark", value: "military"   },
  { label: "Job Relocation",   sub: "Corporate move · Relo package",       icon: "briefcase",        value: "relocation" },
  { label: "Dayton Resident",  sub: "Buying local · Exploring the area",   icon: "home",             value: "discover"   },
];

const HUB_ROUTE: Record<Persona, string> = {
  military:   "/military-hub",
  relocation: "/relocation",
  discover:   "/discover",
};

// ─── Lofty lead push ─────────────────────────────────────────────────────────
async function pushToLofty(data: {
  first_name: string;
  last_name:  string;
  email:      string;
  phone:      string;
  move_timeline: string;
  persona:    string;
}) {
  const apiKey = process.env.EXPO_PUBLIC_LOFTY_API_KEY;
  if (!apiKey || apiKey === "YOUR_LOFTY_API_KEY") return;

  try {
    await fetch("https://api.lofty.com/v1/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        firstName: data.first_name,
        lastName:  data.last_name,
        email:     data.email,
        phone:     data.phone,
        source:    "Dayton Relo App",
        tags:      [data.persona, `timeline: ${data.move_timeline}`],
        note:      `Signed up via Dayton Relo App. Timeline: ${data.move_timeline}. Type: ${data.persona}.`,
      }),
    });
  } catch (e) {
    console.log("Lofty push failed (non-blocking):", e);
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SignupScreen() {
  const [firstName,     setFirstName]     = useState("");
  const [lastName,      setLastName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPw,        setShowPw]        = useState(false);
  const [timeline,      setTimeline]      = useState<MoveTimeline>("3-6 months");
  const [persona,       setPersonaState]  = useState<Persona>("military");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) Alert.alert("Google sign in failed", error);
    else {
      track("signup_completed", { method: "google", persona });
      router.replace(HUB_ROUTE[persona] as any);
    }
  }

  async function handleSignup() {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Missing info", "Please enter your first and last name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Missing info", "Please enter your email address.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Missing info", "Please enter your phone number.");
      return;
    }
    if (!password) {
      Alert.alert("Missing info", "Please create a password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setLoading(false);
      Alert.alert("Sign up failed", authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
      return;
    }

    // 2. Insert profile row
    await supabase.from("profiles").insert({
      id:            userId,
      full_name:     fullName,
      email:         email.trim().toLowerCase(),
      phone:         phone.trim(),
      move_timeline: timeline,
      persona,
    });

    // 3. Push to Lofty (non-blocking)
    pushToLofty({
      first_name:    firstName.trim(),
      last_name:     lastName.trim(),
      email:         email.trim().toLowerCase(),
      phone:         phone.trim(),
      move_timeline: timeline,
      persona,
    });

    // 4. Save persona locally so tools tab is ready immediately
    setPersona(persona);

    track("signup_completed", { method: "email", persona, timeline });

    setLoading(false);
    router.replace(HUB_ROUTE[persona] as any);
  }

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <Image
            source={require("../../assets/images/logo-black.png")}
            style={s.logoImage}
            resizeMode="contain"
          />
          <Text style={s.title}>Create Your Profile</Text>
          <Text style={s.subtitle}>Save homes, bookmark tools, and get personalized tips</Text>
        </View>

        {/* First + Last Name row */}
        <View style={s.nameRow}>
          <View style={s.nameField}>
            <Text style={s.label}>First Name *</Text>
            <TextInput
              style={s.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jane"
              placeholderTextColor={Colors.gray}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
          <View style={s.nameField}>
            <Text style={s.label}>Last Name *</Text>
            <TextInput
              style={s.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Smith"
              placeholderTextColor={Colors.gray}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Email */}
        <Text style={s.label}>Email *</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={Colors.gray}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Phone — mandatory */}
        <Text style={s.label}>Phone *</Text>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(937) 555-0100"
          placeholderTextColor={Colors.gray}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <Text style={s.label}>Password *</Text>
        <View style={s.pwWrap}>
          <TextInput
            style={s.pwInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            placeholderTextColor={Colors.gray}
            secureTextEntry={!showPw}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
            <Ionicons
              name={showPw ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.gray}
            />
          </TouchableOpacity>
        </View>

        {/* Move Timeline */}
        <Text style={s.sectionLabel}>When are you planning to move?</Text>
        <View style={s.chipRow}>
          {TIMELINES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[s.chip, timeline === t.value && s.chipActive]}
              onPress={() => setTimeline(t.value)}
            >
              <Text style={[s.chipText, timeline === t.value && s.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Persona */}
        <Text style={s.sectionLabel}>What describes you best?</Text>
        <View style={s.personaCol}>
          {PERSONAS.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[s.personaCard, persona === p.value && s.personaCardActive]}
              onPress={() => setPersonaState(p.value)}
              activeOpacity={0.8}
            >
              <View style={[s.personaIconBox, persona === p.value && s.personaIconBoxActive]}>
                <Ionicons
                  name={p.icon as any}
                  size={22}
                  color={persona === p.value ? Colors.gold : Colors.gray}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.personaLabel, persona === p.value && s.personaLabelActive]}>
                  {p.label}
                </Text>
                <Text style={s.personaSub}>{p.sub}</Text>
              </View>
              {persona === p.value && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms agreement */}
        <Text style={s.termsText}>
          By creating an account you agree to our{" "}
          <Text style={s.termsLink} onPress={() => router.push("/terms-of-service" as any)}>
            Terms of Service
          </Text>
          {" "}and{" "}
          <Text style={s.termsLink} onPress={() => router.push("/privacy-policy" as any)}>
            Privacy Policy
          </Text>.
        </Text>

        {/* CTA */}
        <TouchableOpacity style={s.primaryBtn} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.black} />
            : <Text style={s.primaryBtnText}>Create My Profile</Text>
          }
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or sign up with</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Google button */}
        <TouchableOpacity style={s.googleBtn} onPress={handleGoogleSignup} disabled={googleLoading}>
          {googleLoading
            ? <ActivityIndicator color={Colors.black} />
            : <>
                <Text style={s.googleIcon}>G</Text>
                <Text style={s.googleBtnText}>Continue with Google</Text>
              </>
          }
        </TouchableOpacity>
        <Text style={s.googleNote}>
          Google sign-in is available in the full app. Use email above during preview.
        </Text>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/auth/login" as any)}>
            <Text style={s.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>



      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },

  // Header
  header: {
    alignItems: "center", marginBottom: 28,
    backgroundColor: Colors.black,
    marginHorizontal: -24, paddingHorizontal: 24,
    marginTop: -60, paddingTop: 70, paddingBottom: 28,
  },
  logoImage: {
    width: 240, height: 82, marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayLight,
    textAlign: "center",
    lineHeight: 20,
  },

  // Name row
  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  nameField: { flex: 1 },

  // Inputs
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.black,
    backgroundColor: "#FAFAFA",
  },
  pwWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
  },
  pwInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.black,
  },
  eyeBtn: { paddingHorizontal: 14 },

  // Chips
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  chipActive:     { borderColor: Colors.gold, backgroundColor: Colors.gold },
  chipText:       { fontSize: 13, color: Colors.gray, fontWeight: "600" },
  chipTextActive: { color: Colors.black },

  // Persona cards
  personaCol: { gap: 10 },
  personaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FAFAFA",
  },
  personaCardActive:   { borderColor: Colors.gold, backgroundColor: "#FFF9E6" },
  personaIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#EFEFEF",
    alignItems: "center", justifyContent: "center",
  },
  personaIconBoxActive: { backgroundColor: Colors.black },
  personaLabel:       { fontSize: 14, fontWeight: "700", color: Colors.gray },
  personaLabelActive: { color: Colors.black },
  personaSub:         { fontSize: 11, color: Colors.grayLight, marginTop: 2 },

  // Buttons
  primaryBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: Colors.black, letterSpacing: 0.3 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { fontSize: 14, color: Colors.gray },
  footerLink: { fontSize: 14, color: Colors.gold, fontWeight: "700" },
  skipBtn:    { alignItems: "center", marginTop: 14 },
  skipText:   { fontSize: 13, color: Colors.gray, textDecorationLine: "underline" },

  // Divider
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.gray, fontWeight: "500" },

  // Google
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: Colors.white,
  },
  googleIcon:    { fontSize: 18, fontWeight: "800", color: "#4285F4" },
  googleBtnText: { fontSize: 15, fontWeight: "600", color: Colors.black },
  googleNote:    { fontSize: 11, color: Colors.gray, textAlign: "center", marginTop: 8, lineHeight: 16 },

  // Terms agreement
  termsText: {
    fontSize: 12, color: Colors.gray, textAlign: "center",
    lineHeight: 18, marginTop: 16,
  },
  termsLink: {
    color: Colors.gold, fontWeight: "600",
  },
});
