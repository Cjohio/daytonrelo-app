import { useEffect, useRef } from "react";
import { Stack, usePathname, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { Colors } from "../shared/theme/colors";
import HeaderActions from "../shared/components/HeaderActions";
import { AuthProvider, useAuth } from "../shared/auth/AuthContext";
import { _setPostHogInstance } from "../shared/analytics";

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
const POSTHOG_HOST    = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const SCREEN_OPTIONS = {
  headerStyle:      { backgroundColor: Colors.black },
  headerTintColor:  Colors.gold,
  headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 0.5 },
  headerBackTitle:  "Back",
  contentStyle:     { backgroundColor: Colors.white },
  headerRight:      () => <HeaderActions />,
};

// Auth gate — boots unauthenticated users to signup
function AuthGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (pathname.startsWith("/auth/")) return; // let auth screens render freely
    if (!user) router.replace("/auth/signup" as any);
  }, [user, loading, pathname]);

  return null;
}

// Auto screen tracker — fires "screen_viewed" on every route change
function ScreenTracker() {
  const pathname  = usePathname();
  const posthog   = usePostHog();
  const prevRoute = useRef<string>("");

  useEffect(() => {
    _setPostHogInstance(posthog);
  }, [posthog]);

  useEffect(() => {
    if (!pathname || pathname === prevRoute.current) return;
    prevRoute.current = pathname;
    posthog.capture("screen_viewed", { screen: pathname });
  }, [pathname, posthog]);

  return null;
}

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{ host: POSTHOG_HOST }}
      autocapture={{ captureScreens: false }}
    >
      <SafeAreaProvider>
        <AuthProvider>
          <AuthGate />
          <ScreenTracker />
          <StatusBar style="light" backgroundColor={Colors.black} />
          <Stack>
            <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
            <Stack.Screen name="auth/login"    options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup"   options={{ headerShown: false }} />
            <Stack.Screen name="auth/forgot"   options={{ headerShown: false }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="military-hub"  options={{ headerShown: false }} />
            <Stack.Screen name="relocation"    options={{ headerShown: false }} />
            <Stack.Screen name="discover"      options={{ headerShown: false }} />
            <Stack.Screen name="military"              options={{ ...SCREEN_OPTIONS, title: "Military & VA" }} />
            <Stack.Screen name="neighborhood-quiz"     options={{ ...SCREEN_OPTIONS, title: "Neighborhood Quiz" }} />
            <Stack.Screen name="bah-calculator"        options={{ ...SCREEN_OPTIONS, title: "BAH Calculator" }} />
            <Stack.Screen name="employer-map"          options={{ ...SCREEN_OPTIONS, title: "Employer Map" }} />
            <Stack.Screen name="rent-vs-buy"           options={{ ...SCREEN_OPTIONS, title: "Rent vs. Buy" }} />
            <Stack.Screen name="cost-of-living"        options={{ ...SCREEN_OPTIONS, title: "Cost of Living" }} />
            <Stack.Screen name="neighborhoods"         options={{ ...SCREEN_OPTIONS, title: "Neighborhoods" }} />
            <Stack.Screen name="neighborhood/[id]"     options={{ ...SCREEN_OPTIONS, title: "Neighborhood" }} />
            <Stack.Screen name="listing"               options={{ ...SCREEN_OPTIONS, title: "Listing Detail" }} />
            <Stack.Screen name="va-lender"             options={{ ...SCREEN_OPTIONS, title: "VA Lender" }} />
            <Stack.Screen name="first-30-days"         options={{ ...SCREEN_OPTIONS, title: "First 30 Days" }} />
            <Stack.Screen name="mortgage-calculator"   options={{ ...SCREEN_OPTIONS, title: "Mortgage Calculator" }} />
            <Stack.Screen name="schools"               options={{ ...SCREEN_OPTIONS, title: "Schools" }} />
            <Stack.Screen name="parks"                 options={{ ...SCREEN_OPTIONS, title: "Parks & Recreation" }} />
            <Stack.Screen name="wpafb"                 options={{ ...SCREEN_OPTIONS, title: "Wright-Patterson AFB" }} />
            <Stack.Screen name="things-to-do"          options={{ ...SCREEN_OPTIONS, title: "Things To Do" }} />
            <Stack.Screen name="edit-profile"          options={{ ...SCREEN_OPTIONS, title: "Edit Profile" }} />
            <Stack.Screen name="dayton-events"         options={{ ...SCREEN_OPTIONS, title: "Dayton Events" }} />
            <Stack.Screen name="privacy-policy"        options={{ ...SCREEN_OPTIONS, title: "Privacy Policy" }} />
            <Stack.Screen name="terms-of-service"      options={{ ...SCREEN_OPTIONS, title: "Terms of Service" }} />
            <Stack.Screen name="pcs-timeline"          options={{ ...SCREEN_OPTIONS, title: "PCS Timeline" }} />
            <Stack.Screen name="on-base-vs-off"        options={{ ...SCREEN_OPTIONS, title: "On-Base vs Off-Base" }} />
            <Stack.Screen name="relo-package"          options={{ ...SCREEN_OPTIONS, title: "Relocation Package" }} />
            <Stack.Screen name="temp-housing"          options={{ ...SCREEN_OPTIONS, title: "Temporary Housing" }} />
            <Stack.Screen name="commute-finder"        options={{ ...SCREEN_OPTIONS, title: "Commute Finder" }} />
            <Stack.Screen name="day-trips"             options={{ ...SCREEN_OPTIONS, title: "Day Trips" }} />
            <Stack.Screen name="local-services"        options={{ ...SCREEN_OPTIONS, title: "Local Services" }} />
            <Stack.Screen name="closing-costs"         options={{ ...SCREEN_OPTIONS, title: "Closing Cost Calculator" }} />
            <Stack.Screen name="neighborhood-compare"  options={{ ...SCREEN_OPTIONS, title: "Compare Neighborhoods" }} />
            <Stack.Screen name="dity-calculator"       options={{ ...SCREEN_OPTIONS, title: "DITY / PPM Calculator" }} />
            <Stack.Screen name="tle-calculator"        options={{ ...SCREEN_OPTIONS, title: "TLE Calculator" }} />
            <Stack.Screen name="open-houses"           options={{ ...SCREEN_OPTIONS, title: "Open Houses" }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}
