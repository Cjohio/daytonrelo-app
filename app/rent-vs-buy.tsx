import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import { track } from "../shared/analytics";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  }
  return `$${Math.round(n).toLocaleString()}`;
}

function calcMonthlyPayment(loan: number, annualRate: number, termYrs: number): number {
  if (loan <= 0) return 0;
  if (annualRate === 0) return loan / (termYrs * 12);
  const r = annualRate / 100 / 12;
  const n = termYrs * 12;
  return loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RentVsBuy() {
  const router = useRouter();

  // ── Inputs ──
  const [homePrice,   setHomePrice]   = useState("265000");
  const [downPct,     setDownPct]     = useState(10);
  const [rateStr,     setRateStr]     = useState("6.75");
  const [termYears,   setTermYears]   = useState(30);
  const [rentStr,     setRentStr]     = useState("1500");
  const [yearsToStay, setYearsToStay] = useState(5);
  const [taxRateStr,  setTaxRateStr]  = useState("2.0");
  const [hoaStr,      setHoaStr]      = useState("0");

  // ── Calculations ──
  const R = useMemo(() => {
    const price    = parseFloat(homePrice.replace(/,/g, "")) || 0;
    const down     = price * (downPct / 100);
    const loan     = price - down;
    const rate     = parseFloat(rateStr)   || 0;
    const rent     = parseFloat(rentStr.replace(/,/g, "")) || 0;
    const taxRate  = parseFloat(taxRateStr) || 0;
    const hoa      = parseFloat(hoaStr)    || 0;

    if (price === 0) return null;

    const mortgage   = calcMonthlyPayment(loan, rate, termYears);
    const monthlyTax = price * (taxRate / 100) / 12;
    const monthlyMaint = price * 0.01 / 12;
    const totalMonthlyOwn = mortgage + monthlyTax + monthlyMaint + hoa;
    const closingCosts = price * 0.03;

    // Year-by-year cumulative analysis
    const monthlyRate = rate / 100 / 12;
    let balance = loan;
    let cumulativeBuyPaid = closingCosts + down;  // upfront on day 1
    let cumulativeRent    = 0;
    let breakEvenYear     = -1;

    let finalNetBuy   = 0;
    let finalRent     = 0;
    let finalEquity   = 0;
    let finalHomeVal  = 0;

    for (let yr = 1; yr <= 30; yr++) {
      // Buying: add this year's housing costs
      cumulativeBuyPaid += totalMonthlyOwn * 12;

      // Amortize 12 months to update balance
      for (let m = 0; m < 12; m++) {
        const interest  = balance * monthlyRate;
        const principal = Math.max(0, mortgage - interest);
        balance = Math.max(0, balance - principal);
      }

      // Home appreciation at 3%/yr
      const homeVal  = price * Math.pow(1.03, yr);
      const equity   = homeVal - balance;
      // Seller's net after ~5% selling costs
      const sellNet  = Math.max(0, equity - homeVal * 0.05);
      const netBuy   = cumulativeBuyPaid - sellNet;

      // Renting: 3% annual rent inflation
      const yearRent = rent * 12 * Math.pow(1.03, yr - 1);
      cumulativeRent += yearRent;

      if (breakEvenYear === -1 && netBuy < cumulativeRent) {
        breakEvenYear = yr;
      }

      if (yr === yearsToStay) {
        finalNetBuy  = netBuy;
        finalRent    = cumulativeRent;
        finalEquity  = equity;
        finalHomeVal = homeVal;
      }
    }

    const buyWins = finalNetBuy < finalRent;

    return {
      mortgage:       Math.round(mortgage),
      monthlyTax:     Math.round(monthlyTax),
      monthlyMaint:   Math.round(monthlyMaint),
      hoa:            Math.round(hoa),
      totalOwn:       Math.round(totalMonthlyOwn),
      rent:           Math.round(rent),
      down:           Math.round(down),
      closingCosts:   Math.round(closingCosts),
      upfront:        Math.round(down + closingCosts),
      netBuy:         Math.round(finalNetBuy),
      netRent:        Math.round(finalRent),
      savings:        Math.round(Math.abs(finalRent - finalNetBuy)),
      equity:         Math.round(finalEquity),
      homeVal:        Math.round(finalHomeVal),
      breakEvenYear,
      buyWins,
    };
  }, [homePrice, downPct, rateStr, termYears, rentStr, yearsToStay, taxRateStr, hoaStr]);

  // ── Track first result ──────────────────────────────────────────────────
  const trackedRvB = useRef(false);
  useEffect(() => {
    if (R && !trackedRvB.current) {
      trackedRvB.current = true;
      track("rent_vs_buy_calculated", {
        homePrice:   parseFloat(homePrice.replace(/,/g, "")) || 0,
        yearsToStay,
        buyWins:     R.buyWins,
        breakEvenYear: R.breakEvenYear,
      });
    }
  }, [R, homePrice, yearsToStay]);

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>RENT VS. BUY</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.intro}>
          Plug in your numbers to see whether buying or renting makes more financial sense for your Dayton move.
        </Text>

        {/* ─── INPUTS ─────────────────────────────────────────────── */}

        <Label>HOME PRICE</Label>
        <InputRow prefix="$">
          <TextInput
            style={s.input} keyboardType="numeric"
            value={homePrice} onChangeText={setHomePrice}
            placeholder="265,000" placeholderTextColor={Colors.grayLight}
          />
        </InputRow>

        <Label>DOWN PAYMENT</Label>
        <ToggleGroup
          options={[{v: 5, label: "5%"}, {v: 10, label: "10%"}, {v: 20, label: "20%"}]}
          value={downPct} onChange={setDownPct}
        />
        {R && (
          <Text style={s.hint}>
            {fmt(R.down)} down · {fmt(R.closingCosts)} est. closing costs · {fmt(R.upfront)} total upfront
          </Text>
        )}

        <Label>INTEREST RATE</Label>
        <InputRow suffix="%">
          <TextInput
            style={[s.input, {flex: 1}]} keyboardType="decimal-pad"
            value={rateStr} onChangeText={setRateStr}
            placeholder="6.75" placeholderTextColor={Colors.grayLight}
          />
        </InputRow>

        <Label>LOAN TERM</Label>
        <ToggleGroup
          options={[{v: 15, label: "15-yr fixed"}, {v: 30, label: "30-yr fixed"}]}
          value={termYears} onChange={setTermYears} wide
        />

        <Label>MONTHLY RENT (WHAT YOU'D PAY TO RENT)</Label>
        <InputRow prefix="$">
          <TextInput
            style={s.input} keyboardType="numeric"
            value={rentStr} onChangeText={setRentStr}
            placeholder="1,500" placeholderTextColor={Colors.grayLight}
          />
        </InputRow>
        <Text style={s.hint}>What would you pay monthly to rent an equivalent home in this area?</Text>

        <Label>YEARS PLANNING TO STAY</Label>
        <ToggleGroup
          options={[
            {v: 2, label: "2yr"}, {v: 3, label: "3yr"}, {v: 5, label: "5yr"},
            {v: 7, label: "7yr"}, {v: 10, label: "10yr"}, {v: 15, label: "15yr"},
          ]}
          value={yearsToStay} onChange={setYearsToStay}
        />

        <Label>PROPERTY TAX RATE</Label>
        <InputRow suffix="%">
          <TextInput
            style={[s.input, {flex: 1}]} keyboardType="decimal-pad"
            value={taxRateStr} onChangeText={setTaxRateStr}
            placeholder="2.0" placeholderTextColor={Colors.grayLight}
          />
        </InputRow>
        <Text style={s.hint}>Dayton area ranges from 1.49% (Tipp City) to 2.64% (Oakwood). Check your neighborhood page.</Text>

        <Label>MONTHLY HOA (IF ANY)</Label>
        <InputRow prefix="$">
          <TextInput
            style={s.input} keyboardType="numeric"
            value={hoaStr} onChangeText={setHoaStr}
            placeholder="0" placeholderTextColor={Colors.grayLight}
          />
        </InputRow>

        {/* ─── RESULTS ─────────────────────────────────────────────── */}
        {R && (
          <>
            <View style={s.divider} />
            <Text style={s.resultsHeading}>YOUR RESULTS</Text>

            {/* Monthly side-by-side */}
            <View style={s.monthlyRow}>
              <View style={[s.monthlyCard, s.rentBg]}>
                <Text style={s.monthlyLabel}>RENTING</Text>
                <Text style={s.monthlyAmount}>{fmt(R.rent)}</Text>
                <Text style={s.monthlySub}>/month</Text>
                <LineItem label="Rent" value={fmt(R.rent)} />
                <LineItem label="Equity built" value="$0" dim />
              </View>

              <View style={[s.monthlyCard, s.buyBg]}>
                <Text style={[s.monthlyLabel, {color: Colors.gold}]}>BUYING</Text>
                <Text style={[s.monthlyAmount, {color: Colors.gold}]}>{fmt(R.totalOwn)}</Text>
                <Text style={s.monthlySub}>/month</Text>
                <LineItem label="Mortgage" value={fmt(R.mortgage)} />
                <LineItem label="Tax" value={fmt(R.monthlyTax)} />
                <LineItem label="Maintenance" value={fmt(R.monthlyMaint)} />
                {R.hoa > 0 && <LineItem label="HOA" value={fmt(R.hoa)} />}
              </View>
            </View>

            {/* Break-even callout */}
            <View style={s.breakEven}>
              <Ionicons name="trending-up-outline" size={22} color={Colors.gold} />
              <View style={{flex: 1, marginLeft: 12}}>
                <Text style={s.breakEvenTitle}>
                  {R.breakEvenYear > 0
                    ? `Break-even at Year ${R.breakEvenYear}`
                    : "Buying beats renting from the start"}
                </Text>
                <Text style={s.breakEvenSub}>
                  {R.breakEvenYear > 0 && R.breakEvenYear <= yearsToStay
                    ? `You plan to stay ${yearsToStay} yrs — past the break-even. Buying makes sense.`
                    : R.breakEvenYear > yearsToStay
                    ? `You plan to stay ${yearsToStay} yrs — before break-even at yr ${R.breakEvenYear}. Renting may be smarter.`
                    : `With Dayton's affordable prices, buying competes strongly.`}
                </Text>
              </View>
            </View>

            {/* Timeline summary table */}
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>AFTER {yearsToStay} YEARS</Text>

              <SummaryRow label="Total spent renting"   value={fmt(R.netRent, true)} />
              <SummaryRow label="Net cost of buying*"   value={fmt(R.netBuy, true)} />

              <View style={s.summaryHighlight}>
                <Text style={s.summaryHighlightLabel}>
                  {R.buyWins ? "You save by buying" : "You save by renting"}
                </Text>
                <Text style={s.summaryHighlightValue}>{fmt(R.savings, true)}</Text>
              </View>

              <View style={s.summaryDivider} />
              <SummaryRow label="Projected home value"  value={fmt(R.homeVal, true)} />
              <SummaryRow label="Equity built"          value={fmt(R.equity, true)} gold />

              <Text style={s.footnote}>
                * Net buying cost subtracts equity after 5% selling costs. Assumes 3% annual home appreciation, 3% annual rent increases, and 1% annual maintenance.
              </Text>
            </View>

            {/* Verdict */}
            <View style={[s.verdict, R.buyWins ? s.verdictBuy : s.verdictRent]}>
              <Ionicons
                name={R.buyWins ? "home" : "receipt-outline"}
                size={22} color={Colors.black}
              />
              <Text style={s.verdictText}>
                {R.buyWins
                  ? `Over ${yearsToStay} years, buying wins by ${fmt(R.savings, true)} in Dayton.`
                  : `For a ${yearsToStay}-year stay, renting saves ${fmt(R.savings, true)}.`}
              </Text>
            </View>
          </>
        )}

        {/* CTA */}
        <TouchableOpacity style={s.cta} onPress={() => router.push("/lender" as any)}>
          <Text style={s.ctaText}>Meet Our Preferred Lender</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.black} />
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Small Components ─────────────────────────────────────────────────────────
function Label({children}: {children: string}) {
  return <Text style={s.label}>{children}</Text>;
}

function InputRow({prefix, suffix, children}: {prefix?: string; suffix?: string; children: React.ReactNode}) {
  return (
    <View style={s.inputRow}>
      {prefix && <Text style={s.affix}>{prefix}</Text>}
      {children}
      {suffix && <Text style={s.affix}>{suffix}</Text>}
    </View>
  );
}

function ToggleGroup({
  options, value, onChange, wide,
}: {
  options: {v: number; label: string}[];
  value: number;
  onChange: (v: number) => void;
  wide?: boolean;
}) {
  return (
    <View style={s.toggleGroup}>
      {options.map(o => (
        <TouchableOpacity
          key={o.v}
          style={[s.toggleBtn, wide && s.toggleBtnWide, value === o.v && s.toggleBtnOn]}
          onPress={() => onChange(o.v)}
        >
          <Text style={[s.toggleBtnTxt, value === o.v && s.toggleBtnTxtOn]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function LineItem({label, value, dim}: {label: string; value: string; dim?: boolean}) {
  return (
    <View style={s.lineItem}>
      <Text style={[s.lineItemLabel, dim && {color: Colors.grayLight}]}>{label}</Text>
      <Text style={[s.lineItemValue, dim && {color: Colors.grayLight}]}>{value}</Text>
    </View>
  );
}

function SummaryRow({label, value, gold}: {label: string; value: string; gold?: boolean}) {
  return (
    <View style={s.summaryRow}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryValue, gold && {color: Colors.success}]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   {flex: 1, backgroundColor: Colors.black},
  scroll: {flex: 1, backgroundColor: Colors.white},
  content:{padding: 20, paddingTop: 16},

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.black,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  backBtn:    {padding: 4},
  headerTitle:{color: Colors.gold, fontSize: 16, fontWeight: "900", letterSpacing: 2, flex: 1, textAlign: "center"},

  intro: {color: Colors.gray, fontSize: 14, lineHeight: 21, marginBottom: 24},

  label: {
    color: Colors.gold, fontSize: 10, fontWeight: "800",
    letterSpacing: 1.5, marginBottom: 8, marginTop: 20,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.offWhite,
  },
  input:    {flex: 1, color: Colors.black, fontSize: 16, fontWeight: "600"},
  affix:    {color: Colors.gray, fontSize: 16, fontWeight: "600"},
  hint:     {color: Colors.gray, fontSize: 12, lineHeight: 17, marginTop: 6},

  toggleGroup: {flexDirection: "row", flexWrap: "wrap", gap: 8},
  toggleBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  toggleBtnWide:   {flex: 1, alignItems: "center"},
  toggleBtnOn:     {backgroundColor: Colors.black, borderColor: Colors.gold},
  toggleBtnTxt:    {color: Colors.gray, fontSize: 13, fontWeight: "600"},
  toggleBtnTxtOn:  {color: Colors.gold},

  divider:        {height: 1, backgroundColor: Colors.border, marginVertical: 28},
  resultsHeading: {
    color: Colors.black, fontSize: 18, fontWeight: "900",
    letterSpacing: 2, marginBottom: 20,
  },

  // Monthly comparison
  monthlyRow:  {flexDirection: "row", gap: 12, marginBottom: 16},
  monthlyCard: {
    flex: 1, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  rentBg:      {backgroundColor: Colors.offWhite},
  buyBg:       {backgroundColor: Colors.black},
  monthlyLabel:{fontSize: 10, fontWeight: "800", letterSpacing: 1.5, color: Colors.gray, marginBottom: 6},
  monthlyAmount:{fontSize: 22, fontWeight: "900", color: Colors.black},
  monthlySub:  {fontSize: 11, color: Colors.gray, marginBottom: 10},
  lineItem:    {flexDirection: "row", justifyContent: "space-between", marginTop: 4},
  lineItemLabel:{fontSize: 11, color: Colors.gray},
  lineItemValue:{fontSize: 11, fontWeight: "700", color: Colors.black},

  // Break-even
  breakEven: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#FFFBF0",
    borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
    marginBottom: 16,
  },
  breakEvenTitle:{color: Colors.black, fontWeight: "800", fontSize: 15, marginBottom: 4},
  breakEvenSub:  {color: Colors.gray, fontSize: 13, lineHeight: 18},

  // Summary table
  summaryCard: {
    backgroundColor: Colors.offWhite, borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  summaryTitle:    {color: Colors.black, fontWeight: "900", fontSize: 13, letterSpacing: 1.5, marginBottom: 14},
  summaryRow:      {flexDirection: "row", justifyContent: "space-between", marginBottom: 10},
  summaryLabel:    {color: Colors.gray, fontSize: 13},
  summaryValue:    {color: Colors.black, fontWeight: "700", fontSize: 13},
  summaryHighlight:{
    flexDirection: "row", justifyContent: "space-between",
    backgroundColor: Colors.black, borderRadius: 8,
    padding: 12, marginBottom: 10,
  },
  summaryHighlightLabel:{color: Colors.white, fontWeight: "700", fontSize: 14},
  summaryHighlightValue:{color: Colors.gold,  fontWeight: "900", fontSize: 14},
  summaryDivider:  {height: 1, backgroundColor: Colors.border, marginBottom: 10},
  footnote:        {color: Colors.grayLight, fontSize: 11, lineHeight: 16, marginTop: 10},

  // Verdict
  verdict: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, padding: 16, marginBottom: 24,
  },
  verdictBuy:  {backgroundColor: Colors.gold},
  verdictRent: {backgroundColor: Colors.grayLight},
  verdictText: {color: Colors.black, fontWeight: "800", fontSize: 15, flex: 1},

  // CTA
  cta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.gold,
    paddingVertical: 16, borderRadius: 12,
  },
  ctaText: {color: Colors.black, fontSize: 16, fontWeight: "800"},
});
