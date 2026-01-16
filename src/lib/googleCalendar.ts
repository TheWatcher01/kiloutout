import { google } from "googleapis";
import prisma from "./prisma";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/google/callback`
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

async function getAuthorizedClient() {
  const settings = await prisma.settings.findUnique({
    where: { id: "settings" },
  });

  if (!settings?.googleAccessToken || !settings?.googleRefreshToken) {
    throw new Error("Google Calendar not connected");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: settings.googleAccessToken,
    refresh_token: settings.googleRefreshToken,
    expiry_date: settings.googleTokenExpiry?.getTime(),
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.settings.update({
        where: { id: "settings" },
        data: {
          googleAccessToken: tokens.access_token,
          googleTokenExpiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
        },
      });
    }
  });

  return oauth2Client;
}

interface BookingData {
  service: { name: string };
  user: { firstName: string; lastName: string; phone?: string | null };
  requestedDate: Date | string;
  requestedTime: string;
  duration: number;
  address: string;
  city: string;
  postalCode: string;
  notes?: string | null;
}

export async function createCalendarEvent(booking: BookingData): Promise<string | null | undefined> {
  try {
    const auth = await getAuthorizedClient();
    const calendar = google.calendar({ version: "v3", auth });

    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    const calendarId = settings?.googleCalendarId || "primary";

    const [hours, minutes] = booking.requestedTime.split(":").map(Number);
    const startDate = new Date(booking.requestedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + booking.duration);

    const event = {
      summary: `${booking.service.name} - ${booking.user.firstName} ${booking.user.lastName}`,
      location: `${booking.address}, ${booking.postalCode} ${booking.city}`,
      description: `Service: ${booking.service.name}
Client: ${booking.user.firstName} ${booking.user.lastName}
${booking.user.phone ? `Téléphone: ${booking.user.phone}` : ""}
Adresse: ${booking.address}, ${booking.postalCode} ${booking.city}
${booking.notes ? `\nNotes: ${booking.notes}` : ""}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Europe/Paris",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return response.data.id;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  booking: BookingData
) {
  try {
    const auth = await getAuthorizedClient();
    const calendar = google.calendar({ version: "v3", auth });

    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    const calendarId = settings?.googleCalendarId || "primary";

    const [hours, minutes] = booking.requestedTime.split(":").map(Number);
    const startDate = new Date(booking.requestedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + booking.duration);

    const event = {
      summary: `${booking.service.name} - ${booking.user.firstName} ${booking.user.lastName}`,
      location: `${booking.address}, ${booking.postalCode} ${booking.city}`,
      description: `Service: ${booking.service.name}
Client: ${booking.user.firstName} ${booking.user.lastName}
${booking.user.phone ? `Téléphone: ${booking.user.phone}` : ""}
Adresse: ${booking.address}, ${booking.postalCode} ${booking.city}
${booking.notes ? `\nNotes: ${booking.notes}` : ""}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Europe/Paris",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    };

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const auth = await getAuthorizedClient();
    const calendar = google.calendar({ version: "v3", auth });

    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    const calendarId = settings?.googleCalendarId || "primary";

    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
}

export async function isGoogleCalendarConnected() {
  const settings = await prisma.settings.findUnique({
    where: { id: "settings" },
  });

  return !!(settings?.googleAccessToken && settings?.googleRefreshToken);
}
