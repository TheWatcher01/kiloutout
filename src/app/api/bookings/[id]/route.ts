import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import {
  updateCalendarEvent,
  deleteCalendarEvent,
  isGoogleCalendarConnected,
} from "@/lib/googleCalendar";

export async function GET(
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

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
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

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role: string }).role;

    if (userRole !== "ADMIN" && booking.userId !== userId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { status, adminNotes, requestedDate, requestedTime, duration } = body;

    const { id } = await params;
    
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: { 
        googleEventId: true, 
        status: true,
        requestedDate: true,
        requestedTime: true,
        duration: true,
      },
    });

    const updateData: any = {};

    if (status) {
      updateData.status = status;

      if (status === "CONFIRMED") {
        updateData.confirmedAt = new Date();
      } else if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      } else if (status === "CANCELLED") {
        updateData.cancelledAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (requestedDate !== undefined) {
      updateData.requestedDate = requestedDate;
    }

    if (requestedTime !== undefined) {
      updateData.requestedTime = requestedTime;
    }

    if (duration !== undefined) {
      updateData.duration = duration;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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

    const isConnected = await isGoogleCalendarConnected();
    
    if (existingBooking?.googleEventId && booking.status === "CONFIRMED") {
      const hasDateTimeChanged = 
        requestedDate !== undefined || 
        requestedTime !== undefined || 
        duration !== undefined;

      if (hasDateTimeChanged) {
        try {
          if (isConnected) {
            await updateCalendarEvent(existingBooking.googleEventId, booking);
          }
        } catch (calendarError) {
          console.error("Error updating calendar event:", calendarError);
        }
      }
    }

    if (status === "CANCELLED" && existingBooking?.googleEventId) {
      try {
        if (isConnected) {
          await deleteCalendarEvent(existingBooking.googleEventId);
        }
        updateData.googleEventId = null;
      } catch (calendarError) {
        console.error("Error deleting calendar event:", calendarError);
      }
    }

    if (status) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          bookingId: booking.id,
          type: `BOOKING_${status}`,
          title: `Réservation ${status === "CONFIRMED" ? "confirmée" : status === "CANCELLED" ? "annulée" : "mise à jour"}`,
          message: `Votre réservation pour ${booking.service.name} a été ${status === "CONFIRMED" ? "confirmée" : status === "CANCELLED" ? "annulée" : "mise à jour"}.`,
        },
      });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}
