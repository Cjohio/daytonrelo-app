import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";

const LAST_UPDATED = "April 2026";
const CONTACT_EMAIL = "Chris@cjohio.com";
const CONTACT_PHONE = "(937) 241-3484";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>

      <Text style={s.intro}>
        Dayton Relo ("we," "our," or "us") is operated by Chris Jurgens, Licensed Ohio Realtor.
        This Privacy Policy explains what information we collect, how we use it, and your rights
        regarding your data. Last updated: {LAST_UPDATED}.
      </Text>

      <Section title="1. Information We Collect">
        <Body>
          <B>Account Information:</B> When you create an account, we collect your name, email
          address, phone number, move timeline, and persona (Military, Corporate, or General).
        </Body>
        <Body>
          <B>Usage Data:</B> We collect information about how you interact with the app —
          screens visited, features used, and saved listings or tools.
        </Body>
        <Body>
          <B>Chat Messages:</B> Messages you send to DaytonBot are processed by Anthropic's
          Claude AI in order to generate responses. These messages are not stored by us
          permanently but are transmitted to Anthropic's API.
        </Body>
        <Body>
          <B>Device Information:</B> We may collect basic device information such as operating
          system type and app version for diagnostic purposes.
        </Body>
      </Section>

      <Section title="2. How We Use Your Information">
        <Body>• Provide and personalize the app experience based on your move timeline and persona</Body>
        <Body>• Connect you with Chris Jurgens for real estate services you request</Body>
        <Body>• Send SMS notifications when you request a tour or contact Chris (via Twilio)</Body>
        <Body>• Display relevant home listings through the SimplyRETS MLS platform</Body>
        <Body>• Show live mortgage rate data from the Federal Reserve (FRED API)</Body>
        <Body>• Remember your saved listings, tools, and preferences</Body>
        <Body>• Improve the app's features and fix issues</Body>
      </Section>

      <Section title="3. Information Sharing">
        <Body>
          We do not sell your personal information. We share data only with the third-party
          service providers necessary to operate the app:
        </Body>
        <Body>• <B>Supabase</B> — secure cloud database and authentication (supabase.com)</Body>
        <Body>• <B>Anthropic</B> — AI chat processing for DaytonBot (anthropic.com)</Body>
        <Body>• <B>Twilio</B> — SMS delivery for tour requests and notifications (twilio.com)</Body>
        <Body>• <B>SimplyRETS</B> — MLS real estate listing data (simplyrets.com)</Body>
        <Body>• <B>Federal Reserve (FRED)</B> — mortgage rate data (stlouisfed.org)</Body>
        <Body>
          We may disclose information if required by law or to protect the rights and safety
          of our users.
        </Body>
      </Section>

      <Section title="4. Data Storage & Security">
        <Body>
          Your account data is stored securely in Supabase, which uses industry-standard
          encryption at rest and in transit. We use Row Level Security to ensure users can
          only access their own data. We do not store payment information.
        </Body>
      </Section>

      <Section title="5. Your Rights">
        <Body>You have the right to:</Body>
        <Body>• <B>Access</B> the personal data we hold about you</Body>
        <Body>• <B>Correct</B> inaccurate information via Edit Profile in the app</Body>
        <Body>• <B>Delete</B> your account and associated data by contacting us</Body>
        <Body>• <B>Opt out</B> of SMS communications at any time by replying STOP</Body>
        <Body>
          To exercise any of these rights, contact us at{" "}
          <Text style={s.link} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            {CONTACT_EMAIL}
          </Text>.
        </Body>
      </Section>

      <Section title="6. Children's Privacy">
        <Body>
          This app is not directed to children under 13. We do not knowingly collect personal
          information from children. If you believe we have inadvertently collected such data,
          please contact us immediately.
        </Body>
      </Section>

      <Section title="7. Third-Party Links">
        <Body>
          The app contains links to external websites (venue sites, parks, event pages, etc.).
          We are not responsible for the privacy practices of those sites and encourage you to
          review their policies.
        </Body>
      </Section>

      <Section title="8. Changes to This Policy">
        <Body>
          We may update this Privacy Policy periodically. Continued use of the app after
          changes are posted constitutes acceptance of the updated policy. We will update the
          "Last Updated" date at the top of this page when changes are made.
        </Body>
      </Section>

      <Section title="9. Contact Us">
        <Body>For any privacy questions or requests:</Body>
        <Body>
          <B>Chris Jurgens — Dayton Relo{"\n"}</B>
          <Text style={s.link} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            {CONTACT_EMAIL}
          </Text>
          {"  ·  "}
          <Text style={s.link} onPress={() => Linking.openURL(`tel:+19372413484`)}>
            {CONTACT_PHONE}
          </Text>
        </Body>
      </Section>

      {/* Link to Terms of Service */}
      <TouchableOpacity
        style={s.tosLink}
        onPress={() => router.push("/terms-of-service" as any)}
        activeOpacity={0.7}
      >
        <Text style={s.tosLinkText}>View Terms of Service →</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <Text style={s.body}>{children}</Text>;
}

function B({ children }: { children: React.ReactNode }) {
  return <Text style={s.bold}>{children}</Text>;
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20 },

  intro: {
    color: Colors.gray, fontSize: 13, lineHeight: 20,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    padding: 14, marginBottom: 4,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },

  section: { marginTop: 24 },
  sectionTitle: {
    color: Colors.black, fontSize: 15, fontWeight: "800",
    marginBottom: 10, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  body: {
    color: Colors.gray, fontSize: 13, lineHeight: 21, marginBottom: 6,
  },
  bold: { fontWeight: "700", color: Colors.black },
  link: { color: Colors.gold, fontWeight: "600" },
  tosLink: {
    marginTop: 28, marginHorizontal: 20, padding: 14,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center",
  },
  tosLinkText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
});
