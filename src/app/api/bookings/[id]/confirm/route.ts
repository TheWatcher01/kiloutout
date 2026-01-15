import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
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
        userId: booking.userId,
        bookingId: booking.id,
        type: "BOOKING_CONFIRMED",
        title: "Réservation confirmée",
        message: `Votre réservation pour ${booking.service.name} a été confirmée pour le ${new Date(booking.requestedDate).toLocaleDateString("fr-FR")}.`,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      { error: "Erreur lors de la confirmation de la réservation" },
      { status: 500 }
    );
  }
}
