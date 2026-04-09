import { useState } from "react";
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Linking, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../shared/theme/colors";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import ChatFAB from "../shared/components/ChatFAB";
import AppTabBar from "../shared/components/AppTabBar";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BenefitItem {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  tag?: string;   // e.g. "National" | "Ohio" | "Disabled Vets"
}

interface BenefitSection {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tagColor?: string;
  items: BenefitItem[];
}

// ─── Content ───────────────────────────────────────────────────────────────────
const SECTIONS: BenefitSection[] = [
  {
    title: "VA Loan Products",
    icon: "shield-checkmark-outline",
    items: [
      {
        icon: "cash-outline",
        title: "$0 Down Payment",
        tag: "National",
        body: "VA-backed purchase loans require no down payment for eligible veterans, active-duty service members, and surviving spouses. No private mortgage insurance (PMI) required — saving hundreds per month compared to conventional loans.",
      },
      {
        icon: "trending-down-outline",
        title: "Competitive Interest Rates",
        tag: "National",
        body: "VA loan rates are typically below conventional rates because the VA guarantees a portion of the loan, reducing lender risk. Shop multiple VA-approved lenders to find the best rate for your situation.",
      },
      {
        icon: "refresh-outline",
        title: "Reusable Benefit",
        tag: "National",
        body: "Your VA loan entitlement can be restored and used again after paying off a prior VA loan or selling the home. You can also have multiple VA loans at once under certain circumstances.",
      },
      {
        icon: "swap-horizontal-outline",
        title: "VA IRRRL — Streamline Refinance",
        tag: "National",
        body: "The Interest Rate Reduction Refinance Loan lets you lower your rate on an existing VA loan with minimal paperwork, often no appraisal, and no out-of-pocket costs by rolling them into the new loan.",
      },
      {
        icon: "wallet-outline",
        title: "VA Cash-Out Refinance",
        tag: "National",
        body: "Replace your current mortgage — VA or non-VA — with a new VA loan and access your home equity for any purpose: home improvements, debt payoff, education, or emergency funds.",
      },
      {
        icon: "people-outline",
        title: "Native American Direct Loan (NADL)",
        tag: "National",
        body: "Eligible Native American veterans can use this program to purchase, build, or improve a home on federal trust land. The VA acts as the direct lender, often at below-market rates.",
      },
    ],
  },
  {
    title: "Disability & Adapted Housing Grants",
    icon: "home-outline",
    items: [
      {
        icon: "star-outline",
        title: "VA Funding Fee Waiver",
        tag: "National",
        body: "Veterans with a service-connected disability rating of 10% or higher are exempt from the VA funding fee — a significant savings. The fee typically ranges from 1.25%–3.3% of the loan amount, so on a $250K home this can mean $3,000–$8,250 back in your pocket.",
      },
      {
        icon: "construct-outline",
        title: "Specially Adapted Housing (SAH) Grant",
        tag: "National",
        body: "For veterans with certain severe service-connected disabilities (such as loss of limb or blindness), the SAH grant helps fund building, purchasing, or modifying a home to meet your needs. Grant amounts are set annually by Congress — verify the current maximum at va.gov.",
      },
      {
        icon: "build-outline",
        title: "Special Housing Adaptation (SHA) Grant",
        tag: "National",
        body: "A smaller grant for veterans with specific service-connected conditions not covered by SAH, such as certain burns or respiratory conditions. Used to adapt an existing home to meet your disability-related needs.",
      },
      {
        icon: "bed-outline",
        title: "Temporary Residence Adaptation (TRA)",
        tag: "National",
        body: "If you are temporarily living in a family member's home while recovering or awaiting your own home, TRA grants help fund modifications to that residence so it's accessible for you.",
      },
    ],
  },
  {
    title: "Legal & Financial Protections",
    icon: "shield-outline",
    items: [
      {
        icon: "lock-closed-outline",
        title: "SCRA — 6% Interest Rate Cap",
        tag: "National",
        body: "The Servicemembers Civil Relief Act caps interest rates at 6% on debts incurred before active-duty service. This applies to mortgages, credit cards, auto loans, and more. Lenders are required to honor this — contact your servicer and provide deployment orders.",
      },
      {
        icon: "home-outline",
        title: "SCRA — Foreclosure Protection",
        tag: "National",
        body: "Lenders cannot foreclose on an active-duty service member's property without a court order. This protection extends 9–12 months after returning from active duty depending on your loan type.",
      },
      {
        icon: "document-text-outline",
        title: "Homeowners Assistance Program (HAP)",
        tag: "National",
        body: "If you suffer a financial loss selling your home due to a PCS move, BRAC closure, or base realignment, HAP may cover the difference between what you paid and what you sold for. Administered by the Department of Defense — verify current eligibility at acq.osd.mil.",
      },
      {
        icon: "call-outline",
        title: "VA Foreclosure Avoidance",
        tag: "National",
        body: "If you fall behind on your VA loan, VA-assigned loan technicians work directly with your lender on your behalf. The VA has a financial interest in keeping veterans in their homes and offers options like repayment plans, loan modifications, and special forbearance.",
      },
    ],
  },
  {
    title: "BAH & Housing Allowances",
    icon: "calculator-outline",
    items: [
      {
        icon: "cash-outline",
        title: "Basic Allowance for Housing (BAH)",
        tag: "National",
        body: "BAH is a monthly, tax-free housing stipend based on your pay grade, dependency status, and duty station ZIP code. For WPAFB, BAH rates are designed to cover median rental costs — many service members apply their full BAH toward a mortgage payment instead.",
      },
      {
        icon: "trending-up-outline",
        title: "BAH Rate Protection",
        tag: "National",
        body: "Once you establish a BAH rate, it is protected from decreases as long as your dependency status and duty station don't change. If rates increase, your BAH goes up — you never take a cut mid-assignment.",
      },
      {
        icon: "calculator-outline",
        title: "BAH as Buying Power",
        tag: "National",
        body: "Lenders can count BAH as qualifying income when calculating your mortgage eligibility. Combined with a $0-down VA loan, your BAH can cover your full monthly payment in many Dayton-area neighborhoods — effectively living mortgage-free.",
      },
    ],
  },
  {
    title: "Ohio State Benefits",
    icon: "flag-outline",
    tagColor: Colors.info,
    items: [
      {
        icon: "home-outline",
        title: "OHFA Ohio Heroes Program",
        tag: "Ohio",
        body: "The Ohio Housing Finance Agency's Ohio Heroes program offers qualifying veterans a discounted mortgage interest rate on home purchases and refinances. Must meet OHFA income and purchase price limits. Visit ohiohome.org to check current rates and eligibility — they update regularly.",
      },
      {
        icon: "cash-outline",
        title: "OHFA Down Payment Assistance",
        tag: "Ohio",
        body: "OHFA partners with Ohio Heroes to offer down payment and closing cost assistance grants to qualifying buyers. This can be combined with a VA loan in some cases to further reduce upfront costs. Verify current grant amounts at ohiohome.org.",
      },
      {
        icon: "ribbon-outline",
        title: "100% Disabled Veteran Property Tax Exemption",
        tag: "Ohio",
        body: "Ohio veterans with a 100% service-connected disability rating are exempt from property taxes on their primary residence. This can save thousands of dollars per year. Apply through your County Auditor (Montgomery County for most WPAFB-area homes).",
      },
      {
        icon: "document-outline",
        title: "Ohio Homestead Exemption (Enhanced for Veterans)",
        tag: "Ohio",
        body: "Disabled veterans who don't qualify for the full 100% exemption may still qualify for the Enhanced Homestead Exemption, which reduces the taxable value of their primary residence. Income limits apply — verify current thresholds at tax.ohio.gov.",
      },
      {
        icon: "people-outline",
        title: "Ohio Veterans Service Commissions",
        tag: "Ohio",
        body: "Every Ohio county has a Veterans Service Commission. Montgomery County and Greene County VSCs offer emergency financial assistance (including housing), benefits navigation, and claims help — all free of charge. They can fast-track benefits you may not know you qualify for.",
      },
      {
        icon: "business-outline",
        title: "Ohio Department of Veterans Services (ODVS)",
        tag: "Ohio",
        body: "ODVS is the state agency overseeing all Ohio veteran benefits. They manage the Ohio Veterans Bonus program, state veterans homes, and connect veterans to housing and financial resources. Visit dvs.ohio.gov or call 1-877-OHIO-VET.",
      },
    ],
  },
];

// ─── Official Resource Links ───────────────────────────────────────────────────
const RESOURCES = [
  { label: "VA Housing Assistance",                 url: "https://www.va.gov/housing-assistance/home-loans/" },
  { label: "Apply for VA Certificate of Eligibility",url: "https://www.va.gov/housing-assistance/home-loans/apply-for-coe-form-26-1880/" },
  { label: "OHFA Ohio Heroes Program",              url: "https://www.ohiohome.org/homebuyer/ohioheroes.aspx" },
  { label: "Ohio Dept. of Veterans Services",       url: "https://dvs.ohio.gov" },
  { label: "SCRA Info — servicemembers.gov",        url: "https://www.servicemembers.gov" },
  { label: "Homeowners Assistance Program (HAP)",   url: "https://www.acq.osd.mil/housing/hap.html" },
  { label: "Ohio Property Tax Exemption Info",      url: "https://tax.ohio.gov/individual/resources/homestead-exemption" },
  { label: "Montgomery County Veterans Services",   url: "https://www.mcohio.org/government/elected_officials/veterans_service_commission/index.php" },
  { label: "Military OneSource",                    url: "https://www.militaryonesource.mil" },
  { label: "DFAS BAH Calculator",                   url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm" },
];

// ─── Tag pill ──────────────────────────────────────────────────────────────────
function TagPill({ label }: { label: string }) {
  const isOhio = label === "Ohio";
  return (
    <View style={[pill.wrap, isOhio && pill.ohio]}>
      <Text style={[pill.text, isOhio && pill.ohioText]}>{label}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  wrap:     { alignSelf: "flex-start", backgroundColor: "#F0EAD6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
  text:     { color: Colors.goldDark, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  ohio:     { backgroundColor: "#E3EEF8" },
  ohioText: { color: Colors.info },
});

// ─── Collapsible Section ───────────────────────────────────────────────────────
function BenefitSection({
  section,
  isOpen,
  onToggle,
}: {
  section: BenefitSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={ss.section}>
      <TouchableOpacity style={ss.header} onPress={onToggle} activeOpacity={0.75}>
        <View style={ss.headerLeft}>
          <View style={ss.iconBox}>
            <Ionicons name={section.icon} size={18} color={Colors.gold} />
          </View>
          <Text style={ss.headerTitle}>{section.title}</Text>
          <View style={ss.badge}>
            <Text style={ss.badgeText}>{section.items.length}</Text>
          </View>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.grayLight}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={ss.body}>
          {section.items.map((item, i) => (
            <View
              key={item.title}
              style={[ss.itemRow, i < section.items.length - 1 && ss.itemDivider]}
            >
              <View style={ss.itemIconBox}>
                <Ionicons name={item.icon} size={20} color={Colors.gold} />
              </View>
              <View style={ss.itemBody}>
                {item.tag && <TagPill label={item.tag} />}
                <Text style={ss.itemTitle}>{item.title}</Text>
                <Text style={ss.itemBody2}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MilitaryBenefitsScreen() {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  function toggleSection(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
  }

  const totalBenefits = SECTIONS.reduce((n, s) => n + s.items.length, 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BrandHeader
        left={<BackBtn onPress={() => router.canGoBack() ? router.back() : router.replace("/military-hub" as any)} />}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.gold} />
            <Text style={styles.heroBadgeText}>MILITARY HOME BUYING</Text>
          </View>
          <Text style={styles.heroTitle}>
            Know Every Benefit{"\n"}Before You Buy
          </Text>
          <Text style={styles.heroBody}>
            From VA loans to Ohio property tax exemptions — a complete guide
            to the national and state benefits available to you as a veteran
            or active-duty service member.
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{totalBenefits}</Text>
              <Text style={styles.statLabel}>Benefits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{SECTIONS.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>OH + US</Text>
              <Text style={styles.statLabel}>Coverage</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.goldDark }]} />
              <Text style={styles.legendText}>National</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
              <Text style={styles.legendText}>Ohio-Specific</Text>
            </View>
          </View>
        </View>

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} style={{ marginTop: 1 }} />
          <Text style={styles.disclaimerText}>
            Benefit amounts, eligibility rules, and program terms change. Always verify
            with official sources before making financial decisions. Links provided below.
          </Text>
        </View>

        {/* ── Collapsible Sections ──────────────────────────────────────── */}
        <View style={styles.sections}>
          {SECTIONS.map((section, i) => (
            <BenefitSection
              key={i}
              section={section}
              isOpen={!!openSections[i]}
              onToggle={() => toggleSection(i)}
            />
          ))}
        </View>

        {/* ── Preferred Lenders CTA ────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.lenderBanner}
          onPress={() => router.push("/lender" as any)}
          activeOpacity={0.85}
        >
          <View style={styles.lenderBannerLeft}>
            <View style={styles.lenderBannerIcon}>
              <Ionicons name="business-outline" size={22} color={Colors.gold} />
            </View>
            <View style={styles.lenderBannerText}>
              <Text style={styles.lenderBannerTitle}>Meet Our Preferred Lenders</Text>
              <Text style={styles.lenderBannerSub}>VA, FHA, conventional & more — vetted for Dayton buyers</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.gold} />
        </TouchableOpacity>

        {/* ── Official Resources ────────────────────────────────────────── */}
        <View style={styles.resourcesWrap}>
          <Text style={styles.resourcesTitle}>Official Resources</Text>
          {RESOURCES.map(({ label, url }) => (
            <TouchableOpacity
              key={label}
              style={styles.resourceRow}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.75}
            >
              <Ionicons name="globe-outline" size={16} color={Colors.gold} />
              <Text style={styles.resourceLabel}>{label}</Text>
              <Ionicons name="open-outline" size={14} color={Colors.grayLight} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <View style={styles.cta}>
          <Ionicons name="shield-checkmark" size={28} color={Colors.gold} style={{ marginBottom: 10 }} />
          <Text style={styles.ctaTitle}>Questions About Your Benefits?</Text>
          <Text style={styles.ctaBody}>
            Chris is an Army veteran and licensed Ohio Realtor. He can walk
            you through your VA eligibility, connect you with a VA-approved
            lender, and help you use every benefit available to you.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Talk to Chris</Text>
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

// ─── Section Styles ───────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.black,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    color: Colors.black, fontWeight: "800", fontSize: 15,
  },
  badge: {
    backgroundColor: Colors.goldMuted + "33",
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  badgeText: {
    color: Colors.goldDark, fontSize: 11, fontWeight: "700",
  },
  body: {
    borderTopWidth: 1, borderTopColor: "#F0F0F0",
  },
  itemRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
    backgroundColor: Colors.white,
  },
  itemDivider: {
    borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  itemIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#F8F6F0",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  itemBody: { flex: 1 },
  itemTitle: {
    color: Colors.black, fontWeight: "700", fontSize: 14, marginBottom: 4,
  },
  itemBody2: {
    color: Colors.gray, fontSize: 13, lineHeight: 19,
  },
});

// ─── Screen Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.black },
  scroll:  { flex: 1, backgroundColor: "#F5F5F5" },
  content: { paddingBottom: 24 },

  hero: {
    backgroundColor: Colors.black,
    paddingHorizontal: 22, paddingVertical: 28,
    borderBottomWidth: 3, borderBottomColor: Colors.gold,
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
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
    marginBottom: 16,
  },
  stat: {
    flex: 1, alignItems: "center", paddingVertical: 12,
  },
  statNum: {
    color: Colors.gold, fontSize: 16, fontWeight: "800",
  },
  statLabel: {
    color: Colors.grayLight, fontSize: 10, marginTop: 2, letterSpacing: 0.3,
  },
  statDivider: {
    width: 1, backgroundColor: "#2A2A2A",
  },
  legendRow: {
    flexDirection: "row", gap: 18,
  },
  legendItem: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  legendDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  legendText: {
    color: Colors.grayLight, fontSize: 12,
  },

  disclaimer: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#E8F0F8",
    marginHorizontal: 16, marginTop: 14, marginBottom: 6,
    padding: 12, borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: Colors.info,
  },
  disclaimerText: {
    flex: 1, color: "#1A4A6A", fontSize: 12, lineHeight: 17,
  },

  sections: {
    paddingHorizontal: 16, paddingTop: 10,
  },

  lenderBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    backgroundColor: Colors.black,
    borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  lenderBannerLeft: {
    flexDirection: "row", alignItems: "center", gap: 14, flex: 1,
  },
  lenderBannerIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: "#1A1A1A",
    borderWidth: 1, borderColor: Colors.goldDark,
    alignItems: "center", justifyContent: "center",
  },
  lenderBannerText: { flex: 1 },
  lenderBannerTitle: { color: Colors.white, fontWeight: "700", fontSize: 15, marginBottom: 3 },
  lenderBannerSub:   { color: Colors.grayLight, fontSize: 12 },

  resourcesWrap: {
    paddingHorizontal: 16, paddingTop: 8,
  },
  resourcesTitle: {
    color: Colors.black, fontWeight: "800", fontSize: 15,
    marginBottom: 8, letterSpacing: 0.3,
  },
  resourceRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#E8E8E8",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    marginHorizontal: -16,
  },
  resourceLabel: { color: Colors.black, fontSize: 14, flex: 1 },

  cta: {
    margin: 16, backgroundColor: Colors.black,
    borderRadius: 16, padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: Colors.goldDark,
    marginTop: 20,
  },
  ctaTitle: {
    color: Colors.white, fontWeight: "800", fontSize: 17,
    textAlign: "center", marginBottom: 8,
  },
  ctaBody: {
    color: Colors.gray, fontSize: 13, textAlign: "center",
    lineHeight: 19, marginBottom: 18,
  },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 28, borderRadius: 10,
  },
  ctaBtnText: { color: Colors.black, fontWeight: "800", fontSize: 14 },
});
