import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

type LoanType = "va" | "conventional" | "fha";

const LOAN_LABELS: Record<LoanType, string> = { va: "VA Loan", conventional: "Conventional", fha: "FHA Loan" };

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

function calcClosingCosts(price: number, downPct: number, loanType: LoanType, isFirstUse: boolean) {
  const loanAmt = price * (1 - downPct / 100);
  const lineItems: { label: string; amount: number; note: string; paid_by?: string }[] = [];

  // Origination / lender fee
  lineItems.push({ label: "Loan Origination Fee", amount: loanAmt * 0.01, note: "Typically 0.5–1% of loan amount. Negotiate with your lender." });

  // Appraisal
  lineItems.push({ label: "Home Appraisal", amount: 550, note: "Dayton area average. VA appraisals can be slightly higher." });

  // Title insurance
  const titleOwner  = price * 0.004;
  const titleLender = loanAmt * 0.003;
  lineItems.push({ label: "Title Insurance (Lender)", amount: titleLender, note: "Required by lender. Protects them, not you." });
  lineItems.push({ label: "Title Insurance (Owner)", amount: titleOwner,  note: "Strongly recommended. One-time fee protects you for as long as you own." });

  // Title search & attorney
  lineItems.push({ label: "Title Search & Settlement", amount: 650, note: "Title company reviews ownership history and runs closing." });

  // Recording fee
  lineItems.push({ label: "Recording Fees (County)", amount: 175, note: "Montgomery County or surrounding county fee to record the deed." });

  // Inspection
  lineItems.push({ label: "Home Inspection", amount: 425, note: "Highly recommended. Budget $375–$500 in Dayton." });

  // VA-specific
  if (loanType === "va") {
    const fundingFeeRate = isFirstUse
      ? (downPct >= 10 ? 0.0125 : downPct >= 5 ? 0.015 : 0.0215)
      : (downPct >= 10 ? 0.0125 : downPct >= 5 ? 0.015 : 0.036);
    const fundingFee = loanAmt * fundingFeeRate;
    lineItems.push({ label: "VA Funding Fee", amount: fundingFee, note: `${(fundingFeeRate * 100).toFixed(2)}% of loan. Can be rolled into loan. Waived if 10%+ service-connected disability.` });
    lineItems.push({ label: "No PMI Required", amount: 0, note: "VA loans have no private mortgage insurance — saves you $100–$300/month." });
  }

  // FHA-specific
  if (loanType === "fha") {
    const ufmip = loanAmt * 0.0175;
    lineItems.push({ label: "FHA Upfront MIP", amount: ufmip, note: "1.75% of loan. Usually rolled into the loan, not paid at closing." });
  }

  // Conventional PMI note
  if (loanType === "conventional" && downPct < 20) {
    lineItems.push({ label: "PMI (monthly, not at closing)", amount: 0, note: `Estimated $${Math.round(loanAmt * 0.007 / 12)}/month until you reach 20% equity.` });
  }

  // Prepaid items
  const insurance = Math.round(price * 0.004 / 12); // ~$100–$150/mo
  lineItems.push({ label: "Homeowner's Insurance (1 year prepaid)", amount: insurance * 12, note: "Required by lender upfront. Budget $80–$160/month in Ohio." });
  lineItems.push({ label: "Prepaid Interest (prorated)", amount: Math.round(loanAmt * 0.07 / 365 * 15), note: "Covers interest from closing date to end of month. Varies." });

  // Escrow setup
  const monthlyTaxes = Math.round(price * 0.018 / 12); // Ohio avg ~1.8%
  lineItems.push({ label: "Property Tax Escrow (2–3 months)", amount: monthlyTaxes * 2.5, note: `Ohio avg property tax ~1.8%. Lender holds 2–3 months in escrow upfront.` });
  lineItems.push({ label: "Insurance Escrow (2 months)", amount: insurance * 2, note: "Lender escrow buffer for homeowner's insurance." });

  const total = lineItems.reduce((sum, l) => sum + l.amount, 0);
  return { lineItems, total, loanAmt };
}

export default function ClosingCostsScreen() {
  const [price,     setPrice]     = useState("265000");
  const [downPct,   setDownPct]   = useState("0");
  const [loanType,  setLoanType]  = useState<LoanType>("va");
  const [firstUse,  setFirstUse]  = useState(true);
  const [calculated, setCalculated] = useState(false);

  const priceNum = parseInt(price.replace(/\D/g, "") || "0");
  const downNum  = Math.min(100, Math.max(0, parseFloat(downPct || "0")));
  const { lineItems, total, loanAmt } = calcClosingCosts(priceNum, downNum, loanType, firstUse);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={s.intro}>
          <Text style={s.introText}>
            Closing costs surprise many buyers. Enter your numbers to get an estimate
            of cash you'll need at the closing table — beyond your down payment.
          </Text>
        </View>

        {/* Inputs */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Purchase Price</Text>
          <View style={s.inputRow}>
            <Text style={s.inputPrefix}>$</Text>
            <TextInput
              style={s.input}
              value={price}
              onChangeText={v => setPrice(v.replace(/\D/g, ""))}
              keyboardType="numeric"
              placeholder="265000"
              placeholderTextColor={Colors.grayLight}
            />
          </View>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Down Payment %</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={downPct}
              onChangeText={setDownPct}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.grayLight}
            />
            <Text style={s.inputSuffix}>%</Text>
          </View>
          {priceNum > 0 && <Text style={s.inputNote}>Down payment: {fmt(priceNum * downNum / 100)} · Loan: {fmt(loanAmt)}</Text>}
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Loan Type</Text>
          <View style={s.segmented}>
            {(["va", "conventional", "fha"] as LoanType[]).map(lt => (
              <TouchableOpacity
                key={lt}
                style={[s.segment, loanType === lt && s.segmentActive]}
                onPress={() => setLoanType(lt)}
              >
                <Text style={[s.segmentText, loanType === lt && s.segmentTextActive]}>
                  {LOAN_LABELS[lt]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loanType === "va" && (
          <View style={s.inputGroup}>
            <Text style={s.label}>VA Loan — First Use?</Text>
            <View style={s.segmented}>
              <TouchableOpacity style={[s.segment, firstUse && s.segmentActive]} onPress={() => setFirstUse(true)}>
                <Text style={[s.segmentText, firstUse && s.segmentTextActive]}>First Use</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.segment, !firstUse && s.segmentActive]} onPress={() => setFirstUse(false)}>
                <Text style={[s.segmentText, !firstUse && s.segmentTextActive]}>Subsequent</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results */}
        <View style={s.resultsCard}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Estimated Closing Costs</Text>
            <Text style={s.totalAmount}>{fmt(total)}</Text>
          </View>
          <Text style={s.totalNote}>
            Typical range for this purchase: {fmt(total * 0.85)} – {fmt(total * 1.15)}
          </Text>

          <View style={s.divider} />

          {lineItems.filter(l => l.amount > 0).map(item => (
            <View key={item.label} style={s.lineItem}>
              <View style={s.lineItemTop}>
                <Text style={s.lineItemLabel}>{item.label}</Text>
                <Text style={s.lineItemAmt}>{fmt(item.amount)}</Text>
              </View>
              <Text style={s.lineItemNote}>{item.note}</Text>
            </View>
          ))}
          {lineItems.filter(l => l.amount === 0 && l.note).map(item => (
            <View key={item.label} style={[s.lineItem, s.lineItemZero]}>
              <Text style={s.lineItemLabel}>{item.label}</Text>
              <Text style={s.lineItemNote}>{item.note}</Text>
            </View>
          ))}
        </View>

        <View style={s.tipBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.gold} />
          <Text style={s.tipText}>
            These are estimates. Your lender is required to give you a Loan Estimate within 3 days
            of application with exact figures. Always compare Loan Estimates from 2–3 lenders.
          </Text>
        </View>

        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => router.push("/lender" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={16} color={Colors.black} />
          <Text style={s.ctaBtnText}>Meet Our Preferred Lender</Text>
        </TouchableOpacity>
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  intro: { backgroundColor: "#EEF4FF", borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#4A90D9" },
  introText: { color: "#1A3A5C", fontSize: 14, lineHeight: 20 },

  inputGroup: { marginBottom: 14 },
  label:      { fontWeight: "700", fontSize: 13, color: Colors.black, marginBottom: 6 },
  inputRow:   { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, backgroundColor: Colors.white },
  inputPrefix:{ color: Colors.gray, fontSize: 16, marginRight: 4 },
  inputSuffix:{ color: Colors.gray, fontSize: 16, marginLeft: 4 },
  input:      { flex: 1, fontSize: 16, color: Colors.black, paddingVertical: 12 },
  inputNote:  { color: Colors.gray, fontSize: 12, marginTop: 4 },

  segmented: { flexDirection: "row", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, overflow: "hidden" },
  segment:   { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: Colors.white },
  segmentActive: { backgroundColor: Colors.black },
  segmentText:   { color: Colors.gray, fontSize: 13, fontWeight: "600" },
  segmentTextActive: { color: Colors.gold },

  resultsCard: { backgroundColor: "#FAFAFA", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  totalRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  totalLabel:  { fontWeight: "800", fontSize: 16, color: Colors.black },
  totalAmount: { fontWeight: "800", fontSize: 24, color: Colors.gold },
  totalNote:   { color: Colors.gray, fontSize: 12, marginBottom: 12 },
  divider:     { height: 1, backgroundColor: Colors.border, marginBottom: 12 },

  lineItem:    { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  lineItemZero:{ backgroundColor: "#F0F8F0", borderRadius: 8, padding: 10, borderBottomWidth: 0, marginBottom: 8 },
  lineItemTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  lineItemLabel:{ fontWeight: "600", fontSize: 13, color: Colors.black, flex: 1, marginRight: 8 },
  lineItemAmt:  { fontWeight: "700", fontSize: 13, color: Colors.black },
  lineItemNote: { color: Colors.gray, fontSize: 12, lineHeight: 16 },

  tipBox: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#FFFBF0", borderRadius: 12, padding: 12, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },
  tipText: { flex: 1, color: Colors.black, fontSize: 13, lineHeight: 18 },

  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 12, padding: 14,
  },
  ctaBtnText: { fontWeight: "700", fontSize: 15, color: Colors.black },
});
