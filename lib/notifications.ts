/**
 * notifications.ts — Event reminder helpers for Dayton Relo
 *
 * Uses expo-notifications to schedule a local notification at 8am
 * on the day of a saved event. The itemId is used as the notification
 * identifier so it can always be canceled without storing an extra ID.
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// How notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge:  false,
  }),
});

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4,  JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/** Request permission to send local notifications. Returns true if granted. */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false; // simulators can't receive notifications

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule an 8am reminder on the day of an event.
 * Uses `itemId` as the notification identifier — deterministic,
 * so it can always be canceled by itemId without storing anything extra.
 *
 * @param itemId    Unique item ID (used as notification identifier)
 * @param title     Event title shown in the notification
 * @param venue     Venue shown as the notification body
 * @param month     3-letter month string, e.g. "APR"
 * @param day       Day number string, e.g. "12"
 * @param year      4-digit year, defaults to current year
 * @returns         The notification identifier, or null if not scheduled
 */
export async function scheduleEventReminder(
  itemId: string,
  title:  string,
  venue:  string,
  month:  string,
  day:    string,
  year:   number = new Date().getFullYear(),
): Promise<string | null> {
  try {
    const monthIndex = MONTH_MAP[month.toUpperCase()];
    if (monthIndex === undefined) return null; // year-round / monthly events

    const dayNum = parseInt(day, 10);
    if (isNaN(dayNum)) return null;

    // Build the reminder: 8am on the event date
    const reminderDate = new Date(year, monthIndex, dayNum, 8, 0, 0, 0);

    // Don't schedule if the event has already passed
    if (reminderDate <= new Date()) return null;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel any existing reminder for this event first
    await cancelEventReminder(itemId);

    const id = await Notifications.scheduleNotificationAsync({
      identifier: itemId,           // deterministic — cancel by itemId
      content: {
        title: `📅 Today: ${title}`,
        body:  venue,
        data:  { itemId },
      },
      trigger: { date: reminderDate },
    });

    return id;
  } catch (e) {
    console.warn("[notifications] Failed to schedule reminder:", e);
    return null;
  }
}

/** Cancel a previously scheduled event reminder by itemId. */
export async function cancelEventReminder(itemId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(itemId);
  } catch {
    // Safe to ignore — notification may not exist
  }
}
