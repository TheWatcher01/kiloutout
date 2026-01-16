import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { isGoogleCalendarConnected } from "@/lib/googleCalendar";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role: string }).role;

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
      select: {
        businessName: true,
        businessAddress: true,
        businessCity: true,
        businessPostalCode: true,
        businessLatitude: true,
        businessLongitude: true,
        businessPhone: true,
        businessEmail: true,
        distanceThreshold: true,
        pricePerKm: true,
        googleCalendarId: true,
        defaultBookingBuffer: true,
        maxAdvanceBookingDays: true,
      },
    });

    const isGoogleConnected = await isGoogleCalendarConnected();

    return NextResponse.json({
      settings: settings || {
        businessName: "Kiloutout Services",
        businessAddress: "1803 route de Toulouse",
        businessCity: "Escatalens",
        businessPostalCode: "82700",
        businessLatitude: 43.9833,
        businessLongitude: 1.2667,
        distanceThreshold: 10,
        pricePerKm: 0.5,
        defaultBookingBuffer: 60,
        maxAdvanceBookingDays: 60,
      },
      isGoogleConnected,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role: string }).role;

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updatedSettings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: {
        businessName: body.businessName,
        businessAddress: body.businessAddress,
        businessCity: body.businessCity,
        businessPostalCode: body.businessPostalCode,
        businessLatitude: body.businessLatitude,
        businessLongitude: body.businessLongitude,
        businessPhone: body.businessPhone,
        businessEmail: body.businessEmail,
        distanceThreshold: body.distanceThreshold,
        pricePerKm: body.pricePerKm,
        googleCalendarId: body.googleCalendarId,
        defaultBookingBuffer: body.defaultBookingBuffer,
        maxAdvanceBookingDays: body.maxAdvanceBookingDays,
      },
      create: {
        id: "settings",
        businessName: body.businessName,
        businessAddress: body.businessAddress,
        businessCity: body.businessCity,
        businessPostalCode: body.businessPostalCode,
        businessLatitude: body.businessLatitude,
        businessLongitude: body.businessLongitude,
        businessPhone: body.businessPhone,
        businessEmail: body.businessEmail,
        distanceThreshold: body.distanceThreshold,
        pricePerKm: body.pricePerKm,
        googleCalendarId: body.googleCalendarId,
        defaultBookingBuffer: body.defaultBookingBuffer,
        maxAdvanceBookingDays: body.maxAdvanceBookingDays,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}
