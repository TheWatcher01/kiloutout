import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { deleteCalendarEvent, isGoogleCalendarConnected } from "@/lib/googleCalendar";
import { sendBookingRejectedEmail } from "@/lib/email";

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

    const body = await request.json();
    const { reason } = body;

    const { id } = await params;
    
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: { googleEventId: true },
    });

    if (existingBooking?.googleEventId) {
      try {
        const isConnected = await isGoogleCalendarConnected();
        if (isConnected) {
          await deleteCalendarEvent(existingBooking.googleEventId);
        }
      } catch (calendarError) {
        console.error("Error deleting calendar event:", calendarError);
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        adminNotes: reason || null,
        googleEventId: null,
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
        type: "BOOKING_CANCELLED",
        title: "Réservation annulée",
        message: reason
          ? `Votre réservation pour ${booking.service.name} a été annulée. Raison: ${reason}`
          : `Votre réservation pour ${booking.service.name} a été annulée.`,
      },
    });

    // Send rejection email (don't await to avoid blocking response)
    sendBookingRejectedEmail(booking, reason).catch((error) => {
      console.error("Failed to send booking rejected email:", error);
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error rejecting booking:", error);
    return NextResponse.json(
      { error: "Erreur lors du rejet de la réservation" },
      { status: 500 }
    );
  }
}
