import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ScrollView, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as StoreReview from "expo-store-review";
import { submitLead } from "../../api/leads";
import { LeadFormData, MoveTimeline, MOVE_TIMELINE_LABELS } from "../types/lead";
import GoldButton from "./GoldButton";
import { Colors } from "../theme/colors";

const TIMELINES = Object.entries(MOVE_TIMELINE_LABELS) as [MoveTimeline, string][];

const EMPLOYERS = [
  "Wright-Patterson AFB",
  "L3Harris Technologies",
  "Kettering Health",
  "Premier Health",
  "Standard Register",
  "Reynolds & Reynolds",
  "CareSource",
  "Dayton Children's Hospital",
  "Other",
];

const EMPTY_FORM: LeadFormData = {
  name:          "",
  email:         "",
  phone:         "",
  moveTimeline:  "3-6months",
  employer:      "",
  message:       "",
};

export default function LeadCaptureForm() {
  const [form,    setForm]    = useState<LeadFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const update =
    (key: keyof LeadFormData) =>
    (value: string) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      Alert.alert("Missing Information", "Please fill in your name, email, and phone number.");
      return;
    }
    if (!form.email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await submitLead(form);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Message Sent!",
        "Thanks for reaching out. Chris will be in touch within 2 hours.",
        [{
          text: "Got it!",
          onPress: async () => {
            setForm(EMPTY_FORM);
            // Prompt for a store review after a successful lead submission
            if (await StoreReview.isAvailableAsync()) {
              await StoreReview.requestReview();
            }
          },
        }]
      );
    } else {
      Alert.alert("Something went wrong", result.error ?? "Please try again.");
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Get in Touch</Text>
      <Text style={styles.subheading}>
        A Dayton relocation specialist will reach out within a few hours.
      </Text>

      {/* Name */}
      <Field label="Full Name *">
        <TextInput
          style={styles.input}
          placeholder="Jane Smith"
          value={form.name}
          onChangeText={update("name")}
          placeholderTextColor={Colors.grayLight}
          autoCapitalize="words"
        />
      </Field>

      {/* Email */}
      <Field label="Email *">
        <TextInput
          style={styles.input}
          placeholder="jane@example.com"
          value={form.email}
          onChangeText={update("email")}
          placeholderTextColor={Colors.grayLight}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Field>

      {/* Phone */}
      <Field label="Phone *">
        <TextInput
          style={styles.input}
          placeholder="(937) 555-0100"
          value={form.phone}
          onChangeText={update("phone")}
          placeholderTextColor={Colors.grayLight}
          keyboardType="phone-pad"
        />
      </Field>

      {/* Employer / Base */}
      <Field label="Employer or Base">
        <TextInput
          style={styles.input}
          placeholder="e.g. Wright-Patterson AFB, L3Harris…"
          value={form.employer}
          onChangeText={update("employer")}
          placeholderTextColor={Colors.grayLight}
        />
        {/* Quick-pick chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {EMPLOYERS.map((emp) => (
            <TouchableOpacity
              key={emp}
              onPress={() => setForm((p) => ({ ...p, employer: emp }))}
              style={[styles.chip, form.employer === emp && styles.chipActive]}
            >
              <Text style={[styles.chipText, form.employer === emp && styles.chipTextActive]}>
                {emp}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Field>

      {/* Move Timeline */}
      <Field label="Move Timeline">
        <View style={styles.timelineRow}>
          {TIMELINES.map(([value, label]) => (
            <TouchableOpacity
              key={value}
              onPress={() => setForm((p) => ({ ...p, moveTimeline: value }))}
              style={[
                styles.timelineBtn,
                form.moveTimeline === value && styles.timelineBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.timelineText,
                  form.moveTimeline === value && styles.timelineTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      {/* Message */}
      <Field label="Anything else?">
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Questions, preferred neighborhoods, budget…"
          value={form.message}
          onChangeText={update("message")}
          placeholderTextColor={Colors.grayLight}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Field>

      {/* Response promise */}
      <View style={styles.responsePromise}>
        <Ionicons name="flash" size={15} color={Colors.gold} />
        <Text style={styles.responsePromiseText}>
          I respond to every message within <Text style={styles.responsePromiseBold}>2 hours</Text> — usually much faster.
        </Text>
      </View>

      <GoldButton
        label="Send Message"
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      <Text style={styles.privacy}>
        Your info is never sold. We use it only to help you find your Dayton home.
      </Text>
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  heading: {
    color: Colors.black,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  subheading: {
    color: Colors.gray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.black,
    backgroundColor: Colors.offWhite,
  },
  textarea: {
    height: 90,
    paddingTop: 12,
  },
  chips: {
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  chipText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextActive: {
    color: Colors.gold,
    fontWeight: "700",
  },
  timelineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  timelineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.white,
  },
  timelineBtnActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  timelineText: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: "500",
  },
  timelineTextActive: {
    color: Colors.gold,
    fontWeight: "700",
  },
  responsePromise: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#F5E088",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 4,
  },
  responsePromiseText: {
    color: Colors.black,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  responsePromiseBold: {
    fontWeight: "800",
    color: Colors.black,
  },
  privacy: {
    color: Colors.grayLight,
    fontSize: 11,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 16,
  },
});
