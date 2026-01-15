import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { toRad, geocodeAddress } from "@/lib/geo";
import { sendBookingCreatedEmail, sendNewBookingNotificationToAdmin } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      serviceId,
      requestedDate,
      requestedTime,
      duration,
      address,
      city,
      postalCode,
      notes,
      selectedOptions,
    } = body;

    if (
      !serviceId ||
      !requestedDate ||
      !requestedTime ||
      !duration ||
      !address ||
      !city ||
      !postalCode
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        serviceOptions: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    const fullAddress = `${address}, ${postalCode} ${city}, France`;
    const geoResult = await geocodeAddress(fullAddress);

    let latitude: number | null = null;
    let longitude: number | null = null;
    let distance: number | null = null;
    let distanceFee = 0;

    if (geoResult) {
      latitude = geoResult.lat;
      longitude = geoResult.lon;

      const settings = await prisma.settings.findUnique({
        where: { id: "settings" },
      });

      if (settings) {
        const R = 6371;
        const dLat = toRad(latitude - settings.businessLatitude);
        const dLon = toRad(longitude - settings.businessLongitude);

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(settings.businessLatitude)) *
            Math.cos(toRad(latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = Math.round(R * c * 100) / 100;

        if (distance > settings.distanceThreshold) {
          distanceFee =
            Math.round(
              (distance - settings.distanceThreshold) *
                settings.pricePerKm *
                100
            ) / 100;
        }
      }
    }

    const baseAmount = service.basePrice * duration;
    let optionsAmount = 0;

    if (selectedOptions && Array.isArray(selectedOptions)) {
      for (const optionId of selectedOptions) {
        const option = service.serviceOptions.find((o) => o.id === optionId);
        if (option) {
          optionsAmount += option.price;
        }
      }
    }

    const totalAmount = baseAmount + optionsAmount + distanceFee;

    const booking = await prisma.booking.create({
      data: {
        userId: (session.user as { id: string }).id,
        serviceId,
        status: "PENDING",
        requestedDate: new Date(requestedDate),
        requestedTime,
        duration,
        address,
        city,
        postalCode,
        latitude,
        longitude,
        distance,
        distanceFee,
        baseAmount,
        optionsAmount,
        totalAmount,
        notes: notes || null,
        options: selectedOptions
          ? {
              create: selectedOptions.map((optionId: string) => {
                const option = service.serviceOptions.find(
                  (o) => o.id === optionId
                );
                return {
                  serviceOptionId: optionId,
                  price: option?.price || 0,
                };
              }),
            }
          : undefined,
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        options: {
          include: {
            serviceOption: true,
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: (session.user as { id: string }).id,
        bookingId: booking.id,
        type: "BOOKING_CREATED",
        title: "Réservation créée",
        message: `Votre réservation pour ${service.name} a été créée avec succès.`,
      },
    });

    // Send emails (don't await to avoid blocking response)
    sendBookingCreatedEmail(booking).catch((error) => {
      console.error("Failed to send booking created email:", error);
    });

    sendNewBookingNotificationToAdmin(booking).catch((error) => {
      console.error("Failed to send admin notification email:", error);
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role: string }).role;

    const whereClause =
      userRole === "ADMIN" ? {} : { userId };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        options: {
          include: {
            serviceOption: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}
