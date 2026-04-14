import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { track } from "../shared/analytics";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDollars(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtDollar(n: number): string {
  return "$" + fmt(Math.round(n));
}

/** Standard mortgage payment formula */
function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Back-calculate max loan from max monthly P&I */
function maxLoanFromPayment(payment: number, annualRate: number, termYears: number): number {
  if (payment <= 0 || annualRate <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (payment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
}

// ─── Shared input field ────────────────────────────────────────────────────────
function Field({
  label, value, onChangeText, prefix, suffix, placeholder, hint,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string; hint?: string;
}) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      {hint && <Text style={f.hint}>{hint}</Text>}
      <View style={f.row}>
        {prefix && <Text style={f.affix}>{prefix}</Text>}
        <TextInput
          style={[f.input, prefix && { paddingLeft: 4 }, suffix && { paddingRight: 4 }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder ?? "0"}
          placeholderTextColor={Colors.grayLight}
          returnKeyType="done"
        />
        {suffix && <Text style={f.affix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap:  { marginBottom: 16 },
  label: { color: Colors.black, fontSize: 13, fontWeight: "700", marginBottom: 2 },
  hint:  { color: Colors.gray, fontSize: 11, marginBottom: 6 },
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12,
  },
  affix: { color: Colors.gray, fontSize: 15, fontWeight: "600" },
  input: {
    flex: 1, paddingVertical: 12, fontSize: 16,
    color: Colors.black, fontWeight: "600",
  },
});

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ label, value, gold, large, faint }: {
  label: string; value: string;
  gold?: boolean; large?: boolean; faint?: boolean;
}) {
  return (
    <View style={r.row}>
      <Text style={[r.label, faint && { color: Colors.grayLight }]}>{label}</Text>
      <Text style={[r.value, gold && r.gold, large && r.large, faint && { color: Colors.grayLight }]}>
        {value}
      </Text>
    </View>
  );
}

const r = StyleSheet.create({
  row:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  label: { color: Colors.gray, fontSize: 14, flex: 1 },
  value: { color: Colors.black, fontSize: 14, fontWeight: "700" },
  gold:  { color: Colors.gold },
  large: { fontSize: 22, fontWeight: "900" },
});

// ─── Tab: What Can I Afford ────────────────────────────────────────────────────
function AffordTab() {
  const [income,   setIncome]   = useState("");
  const [debts,    setDebts]    = useState("");
  const [downPmt,  setDownPmt]  = useState("");
  const [rate,     setRate]     = useState("6.75");
  const [term,     setTerm]     = useState<15 | 30>(30);

  // 28/36 rule
  const grossMonthly  = parseDollars(income) / 12;
  const monthlyDebts  = parseDollars(debts);
  const down          = parseDollars(downPmt);
  const rateVal       = parseFloat(rate) || 0;

  const maxByIncome   = grossMonthly * 0.28;               // 28% rule
  const maxByDebt     = grossMonthly * 0.36 - monthlyDebts; // 36% rule
  const maxPI         = Math.max(0, Math.min(maxByIncome, maxByDebt));

  // Ohio property tax ~1.4%/yr, insurance ~$1,200/yr
  // Solve: PI + tax/12 + ins/12 = maxPI  → PI = maxPI - (price*0.014/12 + 100)
  // Approx iteratively
  let maxHome = 0;
  if (maxPI > 0 && rateVal > 0) {
    const loan = maxLoanFromPayment(maxPI, rateVal, term);
    const price = loan + down;
    // Refine: subtract tax+ins from maxPI
    const taxIns = (price * 0.014) / 12 + 100;
    const refinedPI = Math.max(0, maxPI - taxIns);
    const refinedLoan = maxLoanFromPayment(refinedPI, rateVal, term);
    maxHome = Math.max(0, refinedLoan + down);
  }

  const loanAmt   = Math.max(0, maxHome - down);
  const pi        = monthlyPayment(loanAmt, rateVal, term);
  const tax       = (maxHome * 0.014) / 12;
  const ins       = 100;
  const pmi       = down / maxHome < 0.2 ? (loanAmt * 0.005) / 12 : 0;
  const totalMo   = pi + tax + ins + pmi;
  const dtiHousing = grossMonthly > 0 ? (totalMo / grossMonthly) * 100 : 0;

  const hasResult = maxHome > 0;
  const trackedAfford = useRef(false);
  useEffect(() => {
    if (hasResult && !trackedAfford.current) {
      trackedAfford.current = true;
      track("mortgage_calculated", { tab: "afford", maxHome: Math.round(maxHome), termYears: term, rate: rateVal });
    }
  }, [hasResult, maxHome, term, rateVal]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <View style={s.card}>
          <Text style={s.cardHead}>Your Income & Debts</Text>

          <Field
            label="Annual Household Income"
            value={income}
            onChangeText={setIncome}
            prefix="$"
            placeholder="85,000"
            hint="Combined gross income before taxes"
          />
          <Field
            label="Monthly Debt Payments"
            value={debts}
            onChangeText={setDebts}
            prefix="$"
            placeholder="0"
            hint="Car loans, student loans, credit cards, etc."
          />
          <Field
            label="Down Payment Available"
            value={downPmt}
            onChangeText={setDownPmt}
            prefix="$"
            placeholder="20,000"
          />
          <Field
            label="Interest Rate"
            value={rate}
            onChangeText={setRate}
            suffix="%"
            placeholder="6.75"
          />

          {/* Loan term toggle */}
          <Text style={f.label}>Loan Term</Text>
          <View style={s.termRow}>
            {([30, 15] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.termBtn, term === t && s.termBtnActive]}
                onPress={() => setTerm(t)}
              >
                <Text style={[s.termLabel, term === t && s.termLabelActive]}>
                  {t}-Year
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        {hasResult ? (
          <View style={s.resultCard}>
            <Text style={s.resultHead}>You Can Afford Up To</Text>
            <Text style={s.bigNum}>{fmtDollar(maxHome)}</Text>
            <Text style={s.resultSub}>Based on the 28/36 rule · {term}-year loan</Text>

            <View style={s.divider} />

            <ResultRow label="Loan Amount"         value={fmtDollar(loanAmt)} />
            <ResultRow label="Down Payment"         value={fmtDollar(down)} />
            <ResultRow label="Principal & Interest" value={fmtDollar(pi) + "/mo"} />
            <ResultRow label="Est. Property Tax"    value={fmtDollar(tax) + "/mo"} faint />
            <ResultRow label="Est. Home Insurance"  value={fmtDollar(ins) + "/mo"} faint />
            {pmi > 0 && (
              <ResultRow label="Est. PMI (< 20% down)" value={fmtDollar(pmi) + "/mo"} faint />
            )}
            <ResultRow label="Total Monthly Payment" value={fmtDollar(totalMo) + "/mo"} gold />
            <ResultRow label="Housing Debt-to-Income" value={dtiHousing.toFixed(1) + "%"} />

            <View style={s.daytonnote}>
              <Ionicons name="home-outline" size={14} color={Colors.gold} />
              <Text style={s.daytonNoteText}>
                Dayton median home is $265K — your budget puts{" "}
                {maxHome > 265000
                  ? "most of the metro within reach."
                  : "you well within reach of many great neighborhoods."}
              </Text>
            </View>
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Ionicons name="calculator-outline" size={36} color={Colors.grayLight} />
            <Text style={s.emptyText}>Enter your income above to see your affordability range.</Text>
          </View>
        )}

        <Text style={s.disclaimer}>
          * Estimates use Ohio avg. property tax (~1.4%) and $1,200/yr insurance. For a personalized pre-approval, talk to a lender.
        </Text>
        <TouchableOpacity
          style={s.lenderBtn}
          onPress={() => router.push("/lender" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="business-outline" size={16} color={Colors.black} />
          <Text style={s.lenderBtnText}>Meet Our Preferred Lender</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tab: Payment Calculator ───────────────────────────────────────────────────
function PaymentTab() {
  const [price,    setPrice]    = useState("");
  const [downPmt,  setDownPmt]  = useState("");
  const [downPct,  setDownPct]  = useState("");
  const [rate,     setRate]     = useState("6.75");
  const [term,     setTerm]     = useState<15 | 30>(30);
  const [downMode, setDownMode] = useState<"$" | "%">("$");

  const priceVal = parseDollars(price);
  const rateVal  = parseFloat(rate) || 0;

  // Sync dollar ↔ percent
  function handleDownDollar(v: string) {
    setDownPmt(v);
    if (priceVal > 0) setDownPct(((parseDollars(v) / priceVal) * 100).toFixed(1));
  }
  function handleDownPct(v: string) {
    setDownPct(v);
    if (priceVal > 0) setDownPmt(fmt(priceVal * (parseFloat(v) || 0) / 100));
  }

  const down      = downMode === "$" ? parseDollars(downPmt) : priceVal * (parseFloat(downPct) || 0) / 100;
  const loan      = Math.max(0, priceVal - down);
  const downPctVal = priceVal > 0 ? (down / priceVal) * 100 : 0;

  const pi        = monthlyPayment(loan, rateVal, term);
  const tax       = (priceVal * 0.014) / 12;
  const ins       = 100;
  const pmi       = downPctVal < 20 ? (loan * 0.005) / 12 : 0;
  const totalMo   = pi + tax + ins + pmi;

  const totalPaid    = pi * term * 12;
  const totalInterest = totalPaid - loan;

  const hasResult = priceVal > 0 && loan > 0 && rateVal > 0;
  const trackedPayment = useRef(false);
  useEffect(() => {
    if (hasResult && !trackedPayment.current) {
      trackedPayment.current = true;
      track("mortgage_calculated", { tab: "payment", homePrice: Math.round(priceVal), downPayment: Math.round(down), termYears: term, rate: rateVal });
    }
  }, [hasResult, priceVal, down, term, rateVal]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <View style={s.card}>
          <Text style={s.cardHead}>Loan Details</Text>

          <Field
            label="Home Price"
            value={price}
            onChangeText={setPrice}
            prefix="$"
            placeholder="265,000"
          />

          {/* Down payment with $ / % toggle */}
          <View style={f.wrap}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={f.label}>Down Payment</Text>
              <View style={s.modeToggle}>
                {(["$", "%"] as const).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[s.modeBtn, downMode === m && s.modeBtnActive]}
                    onPress={() => setDownMode(m)}
                  >
                    <Text style={[s.modeLabel, downMode === m && s.modeLabelActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {downMode === "$" ? (
              <View style={f.row}>
                <Text style={f.affix}>$</Text>
                <TextInput
                  style={[f.input, { paddingLeft: 4 }]}
                  value={downPmt}
                  onChangeText={handleDownDollar}
                  keyboardType="decimal-pad"
                  placeholder="20,000"
                  placeholderTextColor={Colors.grayLight}
                  returnKeyType="done"
                />
              </View>
            ) : (
              <View style={f.row}>
                <TextInput
                  style={[f.input, { paddingRight: 4 }]}
                  value={downPct}
                  onChangeText={handleDownPct}
                  keyboardType="decimal-pad"
                  placeholder="10"
                  placeholderTextColor={Colors.grayLight}
                  returnKeyType="done"
                />
                <Text style={f.affix}>%</Text>
              </View>
            )}
            {priceVal > 0 && down > 0 && (
              <Text style={{ color: Colors.gray, fontSize: 11, marginTop: 4 }}>
                {downMode === "$"
                  ? `${downPctVal.toFixed(1)}% of purchase price`
                  : `${fmtDollar(down)} down`}
              </Text>
            )}
          </View>

          <Field
            label="Interest Rate"
            value={rate}
            onChangeText={setRate}
            suffix="%"
            placeholder="6.75"
          />

          {/* Loan term toggle */}
          <Text style={f.label}>Loan Term</Text>
          <View style={s.termRow}>
            {([30, 15] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.termBtn, term === t && s.termBtnActive]}
                onPress={() => setTerm(t)}
              >
                <Text style={[s.termLabel, term === t && s.termLabelActive]}>
                  {t}-Year
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        {hasResult ? (
          <View style={s.resultCard}>
            <Text style={s.resultHead}>Monthly Payment Breakdown</Text>
            <Text style={s.bigNum}>{fmtDollar(totalMo)}<Text style={s.bigNumSub}>/mo</Text></Text>
            <Text style={s.resultSub}>{term}-year fixed · {rateVal}% rate</Text>

            <View style={s.divider} />

            <ResultRow label="Loan Amount"           value={fmtDollar(loan)} />
            <ResultRow label="Down Payment"           value={`${fmtDollar(down)} (${downPctVal.toFixed(1)}%)`} />

            <View style={{ height: 8 }} />

            <ResultRow label="Principal & Interest"  value={fmtDollar(pi) + "/mo"} />
            <ResultRow label="Est. Property Tax"     value={fmtDollar(tax) + "/mo"} faint />
            <ResultRow label="Est. Home Insurance"   value={fmtDollar(ins) + "/mo"} faint />
            {pmi > 0 && (
              <ResultRow label="PMI (< 20% down)"    value={fmtDollar(pmi) + "/mo"} faint />
            )}

            <View style={[s.divider, { marginVertical: 4 }]} />

            <ResultRow label="Total Monthly"         value={fmtDollar(totalMo) + "/mo"} gold />

            <View style={{ height: 8 }} />

            <ResultRow label={`Total Paid (${term} yrs)`}  value={fmtDollar(totalPaid)} faint />
            <ResultRow label="Total Interest Paid"         value={fmtDollar(totalInterest)} faint />

            {pmi > 0 && (
              <View style={s.daytonnote}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.gold} />
                <Text style={s.daytonNoteText}>
                  PMI drops off once you reach 20% equity — typically after a few years of payments or appreciation.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Ionicons name="calculator-outline" size={36} color={Colors.grayLight} />
            <Text style={s.emptyText}>Enter a home price above to calculate your payment.</Text>
          </View>
        )}

        <Text style={s.disclaimer}>
          * Estimates use Ohio avg. property tax (~1.4%) and $1,200/yr insurance. PMI estimated at 0.5%/yr. For exact figures, talk to a lender.
        </Text>
        <TouchableOpacity
          style={s.lenderBtn}
          onPress={() => router.push("/lender" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="business-outline" size={16} color={Colors.black} />
          <Text style={s.lenderBtnText}>Meet Our Preferred Lender</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type Tab = "afford" | "payment";

export default function MortgageCalculatorScreen() {
  const [tab, setTab] = useState<Tab>("afford");

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Tab switcher */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, tab === "afford" && s.tabActive]}
          onPress={() => setTab("afford")}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={15} color={tab === "afford" ? Colors.gold : Colors.gray} />
          <Text style={[s.tabLabel, tab === "afford" && s.tabLabelActive]}>What Can I Afford?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === "payment" && s.tabActive]}
          onPress={() => setTab("payment")}
          activeOpacity={0.8}
        >
          <Ionicons name="calculator-outline" size={15} color={tab === "payment" ? Colors.gold : Colors.gray} />
          <Text style={[s.tabLabel, tab === "payment" && s.tabLabelActive]}>Payment Calculator</Text>
        </TouchableOpacity>
      </View>

      {tab === "afford"  && <AffordTab />}
      {tab === "payment" && <PaymentTab />}
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.black,
    borderBottomWidth: 1, borderBottomColor: "#222",
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 13,
    borderBottomWidth: 3, borderBottomColor: "transparent",
  },
  tabActive:      { borderBottomColor: Colors.gold },
  tabLabel:       { color: Colors.gray, fontSize: 13, fontWeight: "700" },
  tabLabelActive: { color: Colors.gold },

  scroll:  { flex: 1, backgroundColor: Colors.offWhite },
  content: { padding: 16 },

  card: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHead: {
    color: Colors.black, fontSize: 13, fontWeight: "800",
    letterSpacing: 0.3, textTransform: "uppercase",
    marginBottom: 16,
  },

  termRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  termBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center",
  },
  termBtnActive:  { backgroundColor: Colors.black, borderColor: Colors.black },
  termLabel:      { color: Colors.gray, fontWeight: "700", fontSize: 14 },
  termLabelActive:{ color: Colors.gold },

  modeToggle: { flexDirection: "row", gap: 4 },
  modeBtn: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 8, backgroundColor: Colors.offWhite,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  modeBtnActive:  { backgroundColor: Colors.black, borderColor: Colors.black },
  modeLabel:      { color: Colors.gray, fontWeight: "700", fontSize: 13 },
  modeLabelActive:{ color: Colors.gold },

  resultCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderWidth: 2, borderColor: Colors.gold,
  },
  resultHead: {
    color: Colors.gray, fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
  },
  bigNum: {
    color: Colors.black, fontSize: 38, fontWeight: "900",
    letterSpacing: -1,
  },
  bigNumSub: { fontSize: 20, fontWeight: "700", color: Colors.gray },
  resultSub: { color: Colors.gray, fontSize: 12, marginBottom: 4 },
  divider:   { height: 1, backgroundColor: Colors.border, marginVertical: 12 },

  daytonnote: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 8, padding: 10, marginTop: 14,
    borderWidth: 1, borderColor: "#F5E088",
  },
  daytonNoteText: { flex: 1, color: "#7A6000", fontSize: 12, lineHeight: 17 },

  emptyCard: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 40, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  emptyText: { color: Colors.grayLight, fontSize: 14, textAlign: "center", lineHeight: 20 },

  disclaimer: {
    color: Colors.grayLight, fontSize: 11, textAlign: "center",
    lineHeight: 16, paddingHorizontal: 8, marginBottom: 12,
  },

  lenderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.gold,
    paddingVertical: 13, borderRadius: 12,
    marginHorizontal: 0, marginBottom: 4,
  },
  lenderBtnText: { color: Colors.black, fontWeight: "800", fontSize: 14 },
});
