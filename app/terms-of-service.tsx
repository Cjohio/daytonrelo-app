import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";

const LAST_UPDATED = "April 2026";
const CONTACT_EMAIL = "Chris@cjohio.com";

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      <Text style={s.title}>Terms of Service</Text>
      <Text style={s.meta}>Last updated: {LAST_UPDATED}</Text>

      <Text style={s.intro}>
        Welcome to Dayton Relo. By downloading or using this app, you agree to be bound by these
        Terms of Service. Please read them carefully. If you do not agree, do not use the app.
      </Text>

      <Section title="1. About the App">
        <Body>
          Dayton Relo is a real estate and relocation information app operated by Chris Jurgens,
          Licensed Ohio Realtor (License #: Ohio RE). The app provides tools, guides, neighborhood
          information, a community board, and access to a licensed real estate professional to help
          people relocating to or within the Dayton, Ohio area.
        </Body>
      </Section>

      <Section title="2. Not Legal or Financial Advice">
        <Body>
          The content in this app — including calculators, guides, neighborhood comparisons, BAH
          estimates, cost of living data, and mortgage estimates — is provided for informational
          purposes only. It does not constitute legal, financial, tax, or investment advice.
          All real estate transactions should be reviewed with a licensed professional. Calculator
          results are estimates only and may not reflect current market conditions.
        </Body>
      </Section>

      <Section title="3. Eligibility">
        <Body>
          You must be at least 18 years old to create an account or use this app. By using the app,
          you represent that you meet this requirement.
        </Body>
      </Section>

      <Section title="4. Your Account">
        <Body>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity under your account. Notify us immediately at {CONTACT_EMAIL} if you
          suspect unauthorized use of your account. We reserve the right to suspend or terminate
          accounts that violate these Terms.
        </Body>
      </Section>

      <Section title="5. Community Board">
        <Body>
          The Community Board allows users to post messages and replies using a chosen display name.
          By posting, you agree not to submit content that is:
        </Body>
        <Body>
          • Unlawful, abusive, harassing, threatening, or defamatory{"\n"}
          • Spam, advertising, or solicitation not authorized by us{"\n"}
          • False, misleading, or deceptive{"\n"}
          • Infringing on the intellectual property rights of others{"\n"}
          • Sexually explicit or otherwise inappropriate
        </Body>
        <Body>
          We reserve the right to remove any content and ban any user who violates these guidelines,
          without notice. You retain ownership of content you post but grant Dayton Relo a
          non-exclusive, royalty-free license to display it within the app.
        </Body>
      </Section>

      <Section title="6. AI Chat (DaytonBot)">
        <Body>
          The DaytonBot chat feature is powered by Claude AI (Anthropic). Conversations are used
          to generate responses and may be processed by Anthropic in accordance with their policies.
          DaytonBot responses are informational only and do not constitute professional real estate,
          legal, or financial advice. Always verify important information with a licensed
          professional.
        </Body>
      </Section>

      <Section title="7. Listing Data">
        <Body>
          Real estate listing data is provided by third-party MLS data services. Dayton Relo does
          not guarantee the accuracy, completeness, or timeliness of any listing information.
          Listings are subject to change without notice. All properties are subject to prior sale
          or withdrawal.
        </Body>
      </Section>

      <Section title="8. Privacy">
        <Body>
          Your use of the app is also governed by our{" "}
          <Text
            style={s.link}
            onPress={() => router.push("/privacy-policy" as any)}
          >
            Privacy Policy
          </Text>
          , which is incorporated into these Terms by reference.
        </Body>
      </Section>

      <Section title="9. Intellectual Property">
        <Body>
          All content, features, and functionality of this app — including text, graphics, logos,
          and software — are the property of Chris Jurgens / Dayton Relo and are protected by
          applicable intellectual property laws. You may not reproduce, distribute, or create
          derivative works without our express written permission.
        </Body>
      </Section>

      <Section title="10. Disclaimer of Warranties">
        <Body>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES,
          EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED,
          ERROR-FREE, OR FREE OF VIRUSES.
        </Body>
      </Section>

      <Section title="11. Limitation of Liability">
        <Body>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, DAYTON RELO AND CHRIS JURGENS SHALL NOT BE
          LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR
          USE OF THE APP, INCLUDING LOST PROFITS OR DATA, EVEN IF ADVISED OF THE POSSIBILITY
          OF SUCH DAMAGES.
        </Body>
      </Section>

      <Section title="12. Governing Law">
        <Body>
          These Terms are governed by the laws of the State of Ohio, without regard to its conflict
          of law provisions. Any disputes shall be resolved in the courts of Montgomery County, Ohio.
        </Body>
      </Section>

      <Section title="13. Changes to These Terms">
        <Body>
          We may update these Terms from time to time. We will notify users of material changes by
          updating the "Last updated" date above. Continued use of the app after changes constitutes
          acceptance of the revised Terms.
        </Body>
      </Section>

      <Section title="14. Contact Us">
        <Body>
          Questions about these Terms? Reach us at:{"\n"}
          <Text style={s.link} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            {CONTACT_EMAIL}
          </Text>
          {"\n"}Chris Jurgens — Licensed Ohio Realtor{"\n"}
          Team Flory · eXp Realty · Dayton, Ohio
        </Body>
      </Section>

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

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 32 },

  title: {
    fontSize: 24, fontWeight: "800", color: Colors.black,
    paddingHorizontal: 20, paddingTop: 20, marginBottom: 4,
  },
  meta: {
    fontSize: 12, color: Colors.gray,
    paddingHorizontal: 20, marginBottom: 16,
  },
  intro: {
    fontSize: 14, color: Colors.gray, lineHeight: 21,
    paddingHorizontal: 20, marginBottom: 8,
  },
  section: {
    paddingHorizontal: 20, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: Colors.border,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "800", color: Colors.black, marginBottom: 8,
  },
  body: {
    fontSize: 14, color: Colors.gray, lineHeight: 21, marginBottom: 6,
  },
  link: {
    color: Colors.gold, fontWeight: "600", textDecorationLine: "underline",
  },
});
