/**
 * Support — public-facing help page for Dayton Relo.
 *
 * Serves two purposes:
 *   1. Acts as the Support URL required by App Store Connect / Google Play.
 *      Apple reviewers and users click `daytonrelo.com/support` to reach this.
 *   2. In-app help link for signed-in users who have questions.
 *
 * Keep the content honest, helpful, and non-marketing — this is a help page.
 */
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";

const CONTACT_EMAIL = "chris@cjohio.com";
const CONTACT_PHONE = "(937) 241-3484";
const RESPONSE_WINDOW = "within 1 business day";

export default function SupportScreen() {
  return (
    <>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Intro */}
        <Text style={s.intro}>
          Need help with the Dayton Relo app or have a question about moving to the
          Dayton area? You've come to the right place. The fastest way to reach a
          real human is email or phone — Chris personally reads every message and
          typically replies {RESPONSE_WINDOW}.
        </Text>

        {/* Contact card */}
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>Contact</Text>

          <TouchableOpacity
            style={s.contactRow}
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
            activeOpacity={0.7}
          >
            <Text style={s.contactLabel}>Email</Text>
            <Text style={s.contactValue}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>

          <View style={s.contactDivider} />

          <TouchableOpacity
            style={s.contactRow}
            onPress={() => Linking.openURL(`tel:+19372413484`)}
            activeOpacity={0.7}
          >
            <Text style={s.contactLabel}>Phone / Text</Text>
            <Text style={s.contactValue}>{CONTACT_PHONE}</Text>
          </TouchableOpacity>

          <View style={s.contactDivider} />

          <View style={s.contactRow}>
            <Text style={s.contactLabel}>Office Hours</Text>
            <Text style={s.contactValueSmall}>Mon–Sat, 9 AM – 7 PM ET</Text>
          </View>
        </View>

        {/* About */}
        <Section title="About Dayton Relo">
          <Body>
            Dayton Relo is a free app for people moving to — or already living in —
            the Dayton, Ohio area. It combines live MLS home search, neighborhood
            guides, school ratings, a mortgage calculator, military PCS tools, and
            an AI chat assistant in one place.
          </Body>
          <Body>
            The app is built and maintained by Chris Jurgens, a licensed Ohio
            Realtor based in Dayton. Using the app is free and does not obligate
            you to work with Chris for real estate services.
          </Body>
        </Section>

        {/* FAQ */}
        <Section title="Frequently Asked Questions">
          <FAQ
            q="Is the app free?"
            a="Yes. All features are free. There are no subscriptions or in-app purchases."
          />
          <FAQ
            q="Do I have to create an account?"
            a="No. You can browse listings, read neighborhood guides, and use the calculators without signing up. An account lets you save favorites and sync across devices."
          />
          <FAQ
            q="How current are the home listings?"
            a="Listings come from the Dayton-area MLS via the Trestle / CoreLogic feed and refresh several times per hour. Price changes and new listings usually appear within minutes."
          />
          <FAQ
            q="I'm active-duty military. What's specific for me?"
            a="The Military hub includes a BAH calculator, DITY/PPM move calculator, TLE calculator, PCS timeline, on-base vs. off-base guide, a list of VA-experienced lenders, and commute times to Wright-Patterson AFB for every neighborhood."
          />
          <FAQ
            q="How do I delete my account?"
            a="Email chris@cjohio.com from the address tied to your account and Chris will delete it and all associated data within 72 hours. You can also sign out and stop using the app — no data is shared with third parties beyond the services listed in the Privacy Policy."
          />
          <FAQ
            q="Why does DaytonBot sometimes get things wrong?"
            a="DaytonBot is an AI assistant (powered by Anthropic's Claude). It's great at general questions about the area, but it can make mistakes, especially about specific prices, active listings, or policy details. For anything you plan to act on financially or legally, confirm with Chris directly."
          />
          <FAQ
            q="I found a bug or have a feature request."
            a="Please email chris@cjohio.com with a short description and, if possible, a screenshot. Bug reports are read the same day."
          />
          <FAQ
            q="I'm getting an error / the app won't load."
            a="Try force-closing and reopening the app, and check that you're on the latest version in the App Store or Google Play. If it persists, email chris@cjohio.com with your device model and iOS/Android version."
          />
          <FAQ
            q="How do I stop SMS notifications?"
            a="Reply STOP to any text message from the app to opt out immediately."
          />
        </Section>

        {/* Data & privacy shortcuts */}
        <Section title="Data, Privacy & Terms">
          <Body>
            Questions about what data is collected, how it's used, and your rights
            are answered in the Privacy Policy. Terms of use are in the Terms of
            Service.
          </Body>

          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.push("/privacy-policy" as any)}
            activeOpacity={0.7}
          >
            <Text style={s.linkBtnText}>Privacy Policy →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.push("/terms-of-service" as any)}
            activeOpacity={0.7}
          >
            <Text style={s.linkBtnText}>Terms of Service →</Text>
          </TouchableOpacity>
        </Section>

        {/* Real estate disclaimer */}
        <Section title="Real Estate Disclaimer">
          <Body>
            Chris Jurgens is a licensed Realtor in the state of Ohio. The app is
            for informational purposes. It is not a substitute for professional
            advice on real estate, financial, tax, or legal matters. Mortgage
            rates, BAH amounts, and market figures displayed in the app are
            estimates or third-party data and can change.
          </Body>
        </Section>

        <View style={s.footer}>
          <Text style={s.footerText}>
            Dayton Relo · Chris Jurgens, Licensed Ohio Realtor
          </Text>
          <Text style={s.footerTextMuted}>© 2026 CJ Ohio</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
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

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <View style={s.faq}>
      <Text style={s.faqQ}>{q}</Text>
      <Text style={s.faqA}>{a}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20 },

  intro: {
    color: Colors.gray, fontSize: 13, lineHeight: 20,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    padding: 14, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },

  contactCard: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    padding: 16,
    marginBottom: 8,
  },
  contactTitle: {
    color: Colors.gold, fontSize: 12, fontWeight: "900",
    letterSpacing: 2, marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10,
  },
  contactLabel: { color: Colors.grayLight, fontSize: 13, fontWeight: "600" },
  contactValue: { color: Colors.gold, fontSize: 14, fontWeight: "700" },
  contactValueSmall: { color: Colors.white, fontSize: 13, fontWeight: "500" },
  contactDivider: { height: 1, backgroundColor: "#2A2A2A" },

  section: { marginTop: 24 },
  sectionTitle: {
    color: Colors.black, fontSize: 15, fontWeight: "800",
    marginBottom: 10, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  body: {
    color: Colors.gray, fontSize: 13, lineHeight: 21, marginBottom: 8,
  },

  faq: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqQ: { color: Colors.black, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  faqA: { color: Colors.gray, fontSize: 13, lineHeight: 20 },

  linkBtn: {
    marginTop: 8, padding: 12,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center",
  },
  linkBtnText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1, borderTopColor: Colors.border,
    alignItems: "center",
  },
  footerText: { color: Colors.black, fontSize: 12, fontWeight: "600" },
  footerTextMuted: { color: Colors.grayLight, fontSize: 11, marginTop: 4 },
});
