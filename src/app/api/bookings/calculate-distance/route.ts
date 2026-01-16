import { NextRequest, NextResponse } from "next/server";
import { calculateDistance } from "@/lib/geo";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientLat, clientLon } = body;

    if (!clientLat || !clientLon) {
      return NextResponse.json(
        { error: "Coordonnées client requises" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Configuration non trouvée" },
        { status: 500 }
      );
    }

    const distance = calculateDistance(
      settings.businessLatitude,
      settings.businessLongitude,
      clientLat,
      clientLon
    );

    const distanceFee =
      distance > settings.distanceThreshold
        ? Math.round(
            (distance - settings.distanceThreshold) * settings.pricePerKm * 100
          ) / 100
        : 0;

    return NextResponse.json({
      distance,
      distanceFee,
      threshold: settings.distanceThreshold,
      pricePerKm: settings.pricePerKm,
      businessLocation: {
        lat: settings.businessLatitude,
        lon: settings.businessLongitude,
      },
    });
  } catch (error) {
    console.error("Error calculating distance:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul de la distance" },
      { status: 500 }
    );
  }
}
