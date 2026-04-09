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
import { setPersona } from "../../shared/persona";
import { signInWithGoogle } from "../../shared/auth/useGoogleAuth";
import { track } from "../../shared/analytics";

const HUB_ROUTE: Record<string, string> = {
  military:   "/military-hub",
  relocation: "/relocation",
  discover:   "/discover",
};

async function getHubRoute(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("persona")
    .eq("id", userId)
    .single();
  const p = data?.persona as string | undefined;
  if (p && HUB_ROUTE[p]) {
    setPersona(p as any);
    return HUB_ROUTE[p];
  }
  return "/military-hub"; // safe default
}

export default function LoginScreen() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const { error, data } = await signInWithGoogle() as any;
    setGoogleLoading(false);
    if (error) {
      Alert.alert("Google sign in failed", error);
    } else {
      track("login_completed", { method: "google" });
      const userId = data?.user?.id;
      const route = userId ? await getHubRoute(userId) : "/military-hub";
      router.replace(route as any);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Login failed", error.message);
    } else {
      track("login_completed", { method: "email" });
      const userId = data?.user?.id;
      const route = userId ? await getHubRoute(userId) : "/military-hub";
      router.replace(route as any);
    }
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
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Sign in to access your saved homes and tools</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <Text style={s.label}>Email</Text>
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

          <Text style={s.label}>Password</Text>
          <View style={s.pwWrap}>
            <TextInput
              style={s.pwInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
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

          <TouchableOpacity style={s.forgotBtn} onPress={() => router.push("/auth/forgot" as any)}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.primaryBtn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.black} />
              : <Text style={s.primaryBtnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or continue with</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Google button */}
        <TouchableOpacity style={s.googleBtn} onPress={handleGoogleLogin} disabled={googleLoading}>
          {googleLoading
            ? <ActivityIndicator color={Colors.black} />
            : <>
                <Text style={s.googleIcon}>G</Text>
                <Text style={s.googleBtnText}>Sign in with Google</Text>
              </>
          }
        </TouchableOpacity>
        <Text style={s.googleNote}>
          Google sign-in is available in the full app. Use email above to sign in during preview.
        </Text>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/auth/signup" as any)}>
            <Text style={s.footerLink}>Create one free</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.skipBtn} onPress={() => router.replace("/(tabs)/" as any)}>
          <Text style={s.skipText}>Continue without an account</Text>
        </TouchableOpacity>

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
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: "center", marginBottom: 36,
    backgroundColor: Colors.black,
    marginHorizontal: -24, paddingHorizontal: 24,
    marginTop: -60, paddingTop: 70, paddingBottom: 32,
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

  // Form
  form: { gap: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 6,
    marginTop: 12,
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

  forgotBtn: { alignSelf: "flex-end", marginTop: 8 },
  forgotText: { fontSize: 13, color: Colors.gold, fontWeight: "600" },

  primaryBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: { fontSize: 14, color: Colors.gray },
  footerLink: { fontSize: 14, color: Colors.gold, fontWeight: "700" },

  skipBtn: { alignItems: "center", marginTop: 16 },
  skipText: { fontSize: 13, color: Colors.gray, textDecorationLine: "underline" },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 10,
  },
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
  googleIcon: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4285F4",
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  googleNote: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
});
