import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import GoldButton from "../shared/components/GoldButton";
import neighborhoods from "../content/neighborhoods.json";

interface Question {
  id:      string;
  text:    string;
  options: { label: string; value: string; scores: Record<string, number> }[];
}

const QUESTIONS: Question[] = [
  {
    id: "commute",
    text: "What's your primary work destination?",
    options: [
      { label: "Wright-Patterson AFB", value: "wpafb",   scores: { fairborn: 5, beavercreek: 4, xenia: 3 } },
      { label: "L3Harris / Beavercreek", value: "l3",    scores: { beavercreek: 5, fairborn: 4, kettering: 2 } },
      { label: "Kettering / Premier Health", value: "kh", scores: { kettering: 5, centerville: 4, oakwood: 3 } },
      { label: "Downtown Dayton",        value: "dt",    scores: { oakwood: 5, huber: 3, kettering: 3 } },
    ],
  },
  {
    id: "vibe",
    text: "What neighborhood vibe fits you best?",
    options: [
      { label: "Quiet suburban", value: "sub",   scores: { beavercreek: 4, centerville: 5, huber: 3 } },
      { label: "Walkable & urban", value: "urb", scores: { oakwood: 5, kettering: 3 } },
      { label: "Rural & spacious", value: "rur", scores: { xenia: 5, fairborn: 3 } },
      { label: "Lively community", value: "com", scores: { fairborn: 4, huber: 4, beavercreek: 3 } },
    ],
  },
  {
    id: "schools",
    text: "How important are top-rated public schools?",
    options: [
      { label: "Very important",      value: "vhi", scores: { beavercreek: 5, centerville: 5, oakwood: 4 } },
      { label: "Somewhat important",  value: "med", scores: { kettering: 3, fairborn: 3, huber: 3 } },
      { label: "Not a priority",      value: "low", scores: { xenia: 2, fairborn: 2 } },
    ],
  },
  {
    id: "budget",
    text: "What's your approximate home budget?",
    options: [
      { label: "Under $200K",      value: "low",  scores: { xenia: 5, huber: 4, fairborn: 4 } },
      { label: "$200K – $300K",    value: "med",  scores: { fairborn: 5, kettering: 4, huber: 3 } },
      { label: "$300K – $450K",    value: "hi",   scores: { beavercreek: 5, centerville: 4, kettering: 3 } },
      { label: "Over $450K",       value: "lux",  scores: { centerville: 5, oakwood: 5, beavercreek: 3 } },
    ],
  },
  {
    id: "lifestyle",
    text: "What matters most outside of home?",
    options: [
      { label: "Parks & outdoor trails", value: "out", scores: { beavercreek: 4, xenia: 5, centerville: 3 } },
      { label: "Restaurants & nightlife", value: "din", scores: { oakwood: 5, kettering: 3 } },
      { label: "Shopping & convenience", value: "shp", scores: { beavercreek: 4, centerville: 4, huber: 3 } },
      { label: "Military community",      value: "mil", scores: { fairborn: 5, beavercreek: 3 } },
    ],
  },
];

type Answers = Record<string, string>;
type Scores  = Record<string, number>;

function computeScores(answers: Answers): Scores {
  const totals: Scores = {};
  QUESTIONS.forEach(({ id, options }) => {
    const answer = answers[id];
    if (!answer) return;
    const option = options.find((o) => o.value === answer);
    if (!option) return;
    Object.entries(option.scores).forEach(([hood, pts]) => {
      totals[hood] = (totals[hood] ?? 0) + pts;
    });
  });
  return totals;
}

function rankNeighborhoods(scores: Scores) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, score]) => ({
      ...((neighborhoods as any[]).find((n) => n.id === id) ?? { id, name: id, tagline: "" }),
      score,
    }));
}

export default function NeighborhoodQuizScreen() {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done,    setDone]    = useState(false);

  const q = QUESTIONS[step];

  const answer = (value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setDone(false); };

  const progress = ((step) / QUESTIONS.length) * 100;

  if (done) {
    const ranked = rankNeighborhoods(computeScores(answers));
    return (
      <>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.resultHero}>
          <Ionicons name="trophy" size={40} color={Colors.gold} />
          <Text style={styles.resultHeading}>Your Top Matches</Text>
          <Text style={styles.resultSub}>Based on your answers, here are your best-fit Dayton neighborhoods.</Text>
        </View>

        {ranked.map(({ id, name, tagline, score }, i) => (
          <TouchableOpacity
            key={id}
            style={[styles.matchCard, i === 0 && styles.matchCardTop]}
            onPress={() => router.push(`/neighborhood/${id}` as any)}
            activeOpacity={0.85}
          >
            {i === 0 && (
              <View style={styles.topBadge}>
                <Text style={styles.topBadgeText}># Best Match</Text>
              </View>
            )}
            <View style={styles.matchRank}>
              <Text style={styles.matchRankNum}>#{i + 1}</Text>
            </View>
            <View style={styles.matchBody}>
              <Text style={styles.matchName}>{name ?? id}</Text>
              <Text style={styles.matchTagline}>{tagline ?? ""}</Text>
              {/* Score bar */}
              <View style={styles.scoreBar}>
                <View style={[styles.scoreFill, { width: `${Math.min((score / 20) * 100, 100)}%` }]} />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.gold} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ))}

        <View style={styles.resultActions}>
          <GoldButton
            label="Browse Homes in These Areas"
            onPress={() => router.push({
              pathname: "/(tabs)/explore" as any,
              params: { area: ranked[0]?.name ?? "" },
            })}
          />
          <GoldButton label="Retake Quiz"          onPress={reset} variant="outline" style={{ marginTop: 10 }} />
          <GoldButton label="Talk to an Agent"     onPress={() => router.push("/(tabs)/contact")} variant="outline" style={{ marginTop: 10 }} />
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
      </>
    );
  }

  return (
    <>
    <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
    <View style={styles.quizContainer}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.stepCount}>{step + 1} of {QUESTIONS.length}</Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.quizContent}>
        <Text style={styles.question}>{q.text}</Text>

        {q.options.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.optionBtn, answers[q.id] === value && styles.optionBtnActive]}
            onPress={() => answer(value)}
            activeOpacity={0.82}
          >
            <Text style={[styles.optionText, answers[q.id] === value && styles.optionTextActive]}>
              {label}
            </Text>
            {answers[q.id] === value && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
            )}
          </TouchableOpacity>
        ))}

        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
            <Ionicons name="chevron-back" size={16} color={Colors.gray} />
            <Text style={styles.backBtnText}>Previous question</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
    <AppTabBar />
    <ChatFAB />
    </>
  );
}

const styles = StyleSheet.create({
  scroll:         { flex: 1, backgroundColor: Colors.white },
  content:        { padding: 20 },
  quizContainer:  { flex: 1, backgroundColor: Colors.white },
  quizContent:    { padding: 24, paddingBottom: 40 },
  progressTrack:  { height: 4, backgroundColor: Colors.border },
  progressFill:   { height: 4, backgroundColor: Colors.gold },
  stepCount:      { color: Colors.gray, fontSize: 12, textAlign: "right", paddingHorizontal: 20, paddingVertical: 10 },
  question:       { color: Colors.black, fontSize: 20, fontWeight: "800", marginBottom: 24, lineHeight: 27 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    padding: 18, marginBottom: 12, backgroundColor: Colors.offWhite,
  },
  optionBtnActive:  { backgroundColor: Colors.black, borderColor: Colors.black },
  optionText:       { color: Colors.black, fontSize: 15, fontWeight: "500", flex: 1 },
  optionTextActive: { color: Colors.white, fontWeight: "700" },
  backBtn:      { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 },
  backBtnText:  { color: Colors.gray, fontSize: 14 },
  resultHero:   { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20 },
  resultHeading:{ color: Colors.black, fontSize: 24, fontWeight: "900", marginTop: 12, marginBottom: 8 },
  resultSub:    { color: Colors.gray, fontSize: 14, textAlign: "center", lineHeight: 20 },
  matchCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 18, marginBottom: 12, marginHorizontal: 20,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  matchCardTop:  { borderColor: Colors.gold, borderWidth: 2 },
  topBadge: {
    position: "absolute", top: -10, right: 14,
    backgroundColor: Colors.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
  },
  topBadgeText:      { color: Colors.black, fontSize: 10, fontWeight: "800" },
  matchRank:         { width: 36, alignItems: "center" },
  matchRankNum:      { color: Colors.grayLight, fontSize: 22, fontWeight: "900" },
  matchBody:         { flex: 1 },
  matchName:         { color: Colors.black, fontWeight: "800", fontSize: 16, marginBottom: 3 },
  matchTagline:      { color: Colors.gray, fontSize: 12, marginBottom: 8 },
  scoreBar:          { height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  scoreFill:         { height: 4, backgroundColor: Colors.gold, borderRadius: 2 },
  resultActions:     { paddingHorizontal: 20, marginTop: 8 },
});
