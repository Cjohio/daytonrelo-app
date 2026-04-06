/**
 * Push notification infrastructure for Dayton Relo.
 *
 * USAGE
 * ─────
 * Call `registerForPushNotificationsAsync()` once after the user signs in
 * (e.g. in AuthContext or the signup success handler). The returned Expo
 * push token should be saved to the user's Supabase profile row so the
 * backend can target them later.
 *
 * BACKEND WIRING (not yet implemented — add when ready)
 * ─────────────────────────────────────────────────────
 * 1. Save push token to `profiles.push_token` in Supabase on registration.
 * 2. Use Expo's push API (https://exp.host/--/api/v2/push/send) from a
 *    Supabase Edge Function or Zapier to send notifications for:
 *      • Someone replies to your community post
 *      • A listing matching your saved search goes live
 *      • Chris replies to your lead / contact form submission
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── Foreground notification behavior ────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ─── Register for push notifications ─────────────────────────────────────────
/**
 * Request permission and return the Expo push token string, or null if
 * the device doesn't support push / the user declined.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push only works on physical devices
  if (!Device.isDevice) return null;

  // Android: create a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Dayton Relo",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#C9A84C", // gold
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  // Get the project ID for EAS-managed push
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn("[Notifications] No EAS projectId found — push token unavailable.");
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (err) {
    console.warn("[Notifications] Failed to get push token:", err);
    return null;
  }
}

// ─── Schedule a local notification (useful for reminders) ────────────────────
/**
 * Schedule a local push notification at a specific time.
 * Example: remind user to check listings before their PCS date.
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger:  { seconds: triggerSeconds },
    });
  } catch {
    return null;
  }
}
