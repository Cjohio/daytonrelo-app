import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../shared/theme/colors";

export default function ForgotPasswordScreen() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert("Enter your email", "Please enter the email address on your account.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: "daytonrelo://auth/callback",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.gold} />
          </TouchableOpacity>
        </View>
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <Ionicons name="mail-outline" size={48} color={Colors.gold} />
          </View>
          <Text style={s.successTitle}>Check your email</Text>
          <Text style={s.successSub}>
            We sent a password reset link to{"\n"}
            <Text style={s.emailText}>{email}</Text>
          </Text>
          <TouchableOpacity style={s.btn} onPress={() => router.replace("/auth/login" as any)}>
            <Text style={s.btnText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={s.content}>
          <View style={s.iconWrap}>
            <Ionicons name="lock-closed-outline" size={40} color={Colors.gold} />
          </View>
          <Text style={s.title}>Forgot Password?</Text>
          <Text style={s.subtitle}>
            No problem. Enter your email and we'll send you a link to reset it.
          </Text>

          {/* Email input */}
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#888" style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={handleReset}
            />
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.black} />
              : <Text style={s.btnText}>Send Reset Link</Text>
            }
          </TouchableOpacity>

          {/* Back to login */}
          <TouchableOpacity style={s.backLink} onPress={() => router.back()}>
            <Text style={s.backLinkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: Colors.black },
  scroll:      { flexGrow: 1 },
  header:      { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  backBtn:     { width: 40, height: 40, justifyContent: "center" },
  content:     { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  iconWrap:    {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(201,168,76,0.12)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 24, alignSelf: "flex-start",
  },
  title:       { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 10 },
  subtitle:    { fontSize: 15, color: "#aaa", lineHeight: 22, marginBottom: 32 },
  inputWrap:   {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#111", borderRadius: 12,
    borderWidth: 1, borderColor: "#2a2a2a",
    paddingHorizontal: 14, marginBottom: 16, height: 52,
  },
  inputIcon:   { marginRight: 10 },
  input:       { flex: 1, color: "#fff", fontSize: 15 },
  btn:         {
    backgroundColor: Colors.gold, borderRadius: 12,
    height: 52, justifyContent: "center", alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: Colors.black, fontWeight: "700", fontSize: 16 },
  backLink:    { alignItems: "center", marginTop: 24 },
  backLinkText:{ color: "#666", fontSize: 14 },
  // Success state
  successWrap: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(201,168,76,0.12)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 28,
  },
  successTitle:{ fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 12 },
  successSub:  { fontSize: 15, color: "#aaa", lineHeight: 24, marginBottom: 40 },
  emailText:   { color: Colors.gold, fontWeight: "600" },
});
