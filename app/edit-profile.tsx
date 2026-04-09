import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../shared/theme/colors";
import { useAuth, MoveTimeline, Persona } from "../shared/auth/AuthContext";
import { supabase } from "../lib/supabase";

const TIMELINES: { label: string; value: MoveTimeline }[] = [
  { label: "0–3 months",    value: "0-3 months" },
  { label: "3–6 months",    value: "3-6 months" },
  { label: "6–12 months",   value: "6-12 months" },
  { label: "12+ months",    value: "12+ months" },
  { label: "Just Browsing", value: "just browsing" },
];

const PERSONAS: { label: string; value: Persona; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { label: "Military",   value: "military",  icon: "shield-checkmark-outline" },
  { label: "Corporate",  value: "corporate", icon: "briefcase-outline" },
  { label: "General",    value: "general",   icon: "person-outline" },
];

export default function EditProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();

  const [fullName,   setFullName]   = useState(profile?.full_name     ?? "");
  const [phone,      setPhone]      = useState(profile?.phone         ?? "");
  const [timeline,   setTimeline]   = useState<MoveTimeline>(profile?.move_timeline ?? "just browsing");
  const [persona,    setPersona]    = useState<Persona>(profile?.persona ?? "general");
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name:     fullName.trim(),
          phone:         phone.trim(),
          move_timeline: timeline,
          persona,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={18} color={Colors.gray} />
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor={Colors.grayLight}
            autoCorrect={false}
          />
        </View>

        {/* Email (read-only) */}
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputBox, styles.inputDisabled]}>
          <Ionicons name="mail-outline" size={18} color={Colors.grayLight} />
          <Text style={styles.inputReadOnly}>{profile?.email ?? "—"}</Text>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.grayLight} />
        </View>
        <Text style={styles.hint}>Email cannot be changed here. Contact support if needed.</Text>

        {/* Phone */}
        <Text style={[styles.label, { marginTop: 20 }]}>Phone</Text>
        <View style={styles.inputBox}>
          <Ionicons name="call-outline" size={18} color={Colors.gray} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={Colors.grayLight}
            keyboardType="phone-pad"
          />
        </View>

        {/* Move Timeline */}
        <Text style={[styles.label, { marginTop: 24 }]}>Move Timeline</Text>
        <View style={styles.optionGrid}>
          {TIMELINES.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[styles.optionBtn, timeline === value && styles.optionBtnActive]}
              onPress={() => setTimeline(value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, timeline === value && styles.optionTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Persona */}
        <Text style={[styles.label, { marginTop: 24 }]}>I am…</Text>
        <View style={styles.personaRow}>
          {PERSONAS.map(({ label, value, icon }) => (
            <TouchableOpacity
              key={value}
              style={[styles.personaBtn, persona === value && styles.personaBtnActive]}
              onPress={() => setPersona(value)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={icon}
                size={22}
                color={persona === value ? Colors.gold : Colors.gray}
              />
              <Text style={[styles.personaLabel, persona === value && styles.personaLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={Colors.black} />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 20 },

  label: {
    color: Colors.black, fontWeight: "700", fontSize: 14,
    marginBottom: 8,
  },
  hint: {
    color: Colors.grayLight, fontSize: 11, marginTop: 4, marginLeft: 2,
  },

  inputBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.offWhite, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5", borderColor: "#E8E8E8",
  },
  input: {
    flex: 1, fontSize: 15, color: Colors.black,
  },
  inputReadOnly: {
    flex: 1, fontSize: 15, color: Colors.grayLight,
  },

  optionGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  optionBtnActive: {
    backgroundColor: Colors.black, borderColor: Colors.black,
  },
  optionText: {
    color: Colors.gray, fontWeight: "600", fontSize: 13,
  },
  optionTextActive: {
    color: Colors.gold, fontWeight: "700",
  },

  personaRow: {
    flexDirection: "row", gap: 10,
  },
  personaBtn: {
    flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite,
    gap: 6,
  },
  personaBtnActive: {
    backgroundColor: Colors.black, borderColor: Colors.black,
  },
  personaLabel: {
    color: Colors.gray, fontWeight: "600", fontSize: 13,
  },
  personaLabelActive: {
    color: Colors.gold, fontWeight: "700",
  },

  saveBtn: {
    backgroundColor: Colors.gold, borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
    marginTop: 32,
  },
  saveBtnText: {
    color: Colors.black, fontWeight: "800", fontSize: 16, letterSpacing: 0.3,
  },
});
