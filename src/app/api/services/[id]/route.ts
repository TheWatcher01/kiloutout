import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        priceOptions: {
          where: {
            isActive: true,
          },
        },
        serviceOptions: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du service" },
      { status: 500 }
    );
  }
}
