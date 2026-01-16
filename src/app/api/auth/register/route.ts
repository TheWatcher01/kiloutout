import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        role: "CLIENT",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Send welcome email (don't await to avoid blocking response)
    sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    return NextResponse.json(
      { message: "Compte créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
