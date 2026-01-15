import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Créer les paramètres par défaut
    const settings = await prisma.settings.upsert({
        where: { id: "settings" },
        update: {},
        create: {
            id: "settings",
            businessName: "Kiloutout Services",
            businessAddress: "1803 route de Toulouse",
            businessCity: "Escatalens",
            businessPostalCode: "82700",
            businessLatitude: 43.9833,
            businessLongitude: 1.2667,
            businessPhone: "06 00 00 00 00",
            businessEmail: "contact@kiloutout.fr",
            distanceThreshold: 10,
            pricePerKm: 0.5,
        },
    });
    console.log("✅ Settings created");

    // Créer un compte admin par défaut
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@kiloutout.fr" },
        update: {},
        create: {
            email: "admin@kiloutout.fr",
            password: hashedPassword,
            firstName: "Admin",
            lastName: "Kiloutout",
            phone: "06 00 00 00 00",
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // Créer un compte client de test
    const clientPassword = await bcrypt.hash("client123", 12);
    const client = await prisma.user.upsert({
        where: { email: "client@test.fr" },
        update: {},
        create: {
            email: "client@test.fr",
            password: clientPassword,
            firstName: "Jean",
            lastName: "Dupont",
            phone: "06 11 22 33 44",
            address: "15 rue de la République",
            city: "Montauban",
            postalCode: "82000",
            role: "CLIENT",
        },
    });
    console.log("✅ Client user created:", client.email);

    // Créer les services
    const services = [
        {
            name: "Conciergerie",
            slug: "conciergerie",
            description:
                "Service de conciergerie complet pour gérer vos besoins quotidiens : réception de colis, gestion des clés, accompagnement de prestataires, courses et commissions diverses.",
            icon: "Concierge",
            basePrice: 25,
            unit: "heure",
            minDuration: 1,
            maxDuration: 8,
        },
        {
            name: "Femme de ménage",
            slug: "menage",
            description:
                "Service de ménage professionnel pour votre domicile : dépoussiérage, aspiration, nettoyage des sols, sanitaires et cuisine. Produits écologiques disponibles.",
            icon: "Sparkles",
            basePrice: 22,
            unit: "heure",
            minDuration: 2,
            maxDuration: 8,
        },
        {
            name: "Aide à la personne",
            slug: "aide-personne",
            description:
                "Accompagnement et assistance pour les personnes âgées ou à mobilité réduite : aide aux déplacements, compagnie, accompagnement médical, aide aux courses.",
            icon: "Heart",
            basePrice: 28,
            unit: "heure",
            minDuration: 1,
            maxDuration: 8,
        },
        {
            name: "Repassage",
            slug: "repassage",
            description:
                "Service de repassage soigné de vos vêtements et linges de maison. Récupération et livraison à domicile possible.",
            icon: "Shirt",
            basePrice: 18,
            unit: "heure",
            minDuration: 1,
            maxDuration: 4,
        },
        {
            name: "Gardiennage d'animaux",
            slug: "gardiennage-animaux",
            description:
                "Garde et soins de vos animaux de compagnie à votre domicile ou chez le prestataire : promenades, alimentation, câlins et jeux.",
            icon: "PawPrint",
            basePrice: 15,
            unit: "heure",
            minDuration: 1,
            maxDuration: 24,
        },
        {
            name: "Tonte de pelouse",
            slug: "tonte-pelouse",
            description:
                "Entretien de votre pelouse : tonte, ramassage de l'herbe, bordures. Tarif adapté selon la surface de votre jardin.",
            icon: "Trees",
            basePrice: 30,
            unit: "heure",
            minDuration: 1,
            maxDuration: 6,
        },
    ];

    for (const serviceData of services) {
        const service = await prisma.service.upsert({
            where: { slug: serviceData.slug },
            update: serviceData,
            create: serviceData,
        });
        console.log(`✅ Service created: ${service.name}`);

        // Ajouter des options pour certains services
        if (service.slug === "menage") {
            await prisma.serviceOption.upsert({
                where: { id: `${service.id}-produits` },
                update: {},
                create: {
                    id: `${service.id}-produits`,
                    serviceId: service.id,
                    name: "Fourniture des produits ménagers",
                    description: "Nous fournissons tous les produits ménagers écologiques",
                    price: 5,
                },
            });
            await prisma.serviceOption.upsert({
                where: { id: `${service.id}-vitres` },
                update: {},
                create: {
                    id: `${service.id}-vitres`,
                    serviceId: service.id,
                    name: "Nettoyage des vitres",
                    description: "Inclut le nettoyage intérieur des vitres",
                    price: 10,
                },
            });
            // Options de surface
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-surface-small` },
                update: {},
                create: {
                    id: `${service.id}-surface-small`,
                    serviceId: service.id,
                    name: "Surface < 50m²",
                    priceModifier: 1.0,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-surface-medium` },
                update: {},
                create: {
                    id: `${service.id}-surface-medium`,
                    serviceId: service.id,
                    name: "Surface 50-100m²",
                    priceModifier: 1.2,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-surface-large` },
                update: {},
                create: {
                    id: `${service.id}-surface-large`,
                    serviceId: service.id,
                    name: "Surface > 100m²",
                    priceModifier: 1.5,
                    modifierType: "MULTIPLIER",
                },
            });
        }

        if (service.slug === "gardiennage-animaux") {
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-animals-1` },
                update: {},
                create: {
                    id: `${service.id}-animals-1`,
                    serviceId: service.id,
                    name: "1 animal",
                    priceModifier: 1.0,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-animals-2` },
                update: {},
                create: {
                    id: `${service.id}-animals-2`,
                    serviceId: service.id,
                    name: "2 animaux",
                    priceModifier: 1.3,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-animals-3` },
                update: {},
                create: {
                    id: `${service.id}-animals-3`,
                    serviceId: service.id,
                    name: "3+ animaux",
                    priceModifier: 1.5,
                    modifierType: "MULTIPLIER",
                },
            });
        }

        if (service.slug === "tonte-pelouse") {
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-garden-small` },
                update: {},
                create: {
                    id: `${service.id}-garden-small`,
                    serviceId: service.id,
                    name: "Jardin < 200m²",
                    priceModifier: 1.0,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-garden-medium` },
                update: {},
                create: {
                    id: `${service.id}-garden-medium`,
                    serviceId: service.id,
                    name: "Jardin 200-500m²",
                    priceModifier: 1.5,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.priceOption.upsert({
                where: { id: `${service.id}-garden-large` },
                update: {},
                create: {
                    id: `${service.id}-garden-large`,
                    serviceId: service.id,
                    name: "Jardin > 500m²",
                    priceModifier: 2.0,
                    modifierType: "MULTIPLIER",
                },
            });
            await prisma.serviceOption.upsert({
                where: { id: `${service.id}-bordures` },
                update: {},
                create: {
                    id: `${service.id}-bordures`,
                    serviceId: service.id,
                    name: "Finition des bordures",
                    description: "Coupe précise des bordures au coupe-bordure",
                    price: 15,
                },
            });
            await prisma.serviceOption.upsert({
                where: { id: `${service.id}-ramassage` },
                update: {},
                create: {
                    id: `${service.id}-ramassage`,
                    serviceId: service.id,
                    name: "Ramassage de l'herbe",
                    description: "Ramassage et évacuation de l'herbe coupée",
                    price: 10,
                },
            });
        }

        if (service.slug === "repassage") {
            await prisma.serviceOption.upsert({
                where: { id: `${service.id}-livraison` },
                update: {},
                create: {
                    id: `${service.id}-livraison`,
                    serviceId: service.id,
                    name: "Récupération et livraison",
                    description: "Service de récupération et livraison à domicile",
                    price: 8,
                },
            });
        }
    }

    // Créer les disponibilités par défaut (Lundi à Vendredi, 8h-18h)
    const weekDays = [1, 2, 3, 4, 5]; // Lundi à Vendredi
    for (const day of weekDays) {
        await prisma.availability.upsert({
            where: {
                dayOfWeek_startTime_endTime: {
                    dayOfWeek: day,
                    startTime: "08:00",
                    endTime: "18:00",
                },
            },
            update: {},
            create: {
                dayOfWeek: day,
                startTime: "08:00",
                endTime: "18:00",
                isActive: true,
            },
        });
    }
    console.log("✅ Default availabilities created");

    // Créer quelques réservations de démonstration
    const menageService = await prisma.service.findUnique({
        where: { slug: "menage" },
    });

    if (menageService) {
        // Réservation en attente
        await prisma.booking.create({
            data: {
                userId: client.id,
                serviceId: menageService.id,
                status: "PENDING",
                requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
                requestedTime: "09:00",
                duration: 180, // 3 heures
                address: "15 rue de la République",
                city: "Montauban",
                postalCode: "82000",
                latitude: 44.0176,
                longitude: 1.3547,
                distance: 15.3,
                distanceFee: 2.65, // (15.3 - 10) * 0.5
                baseAmount: 66, // 22€ * 3h
                optionsAmount: 0,
                totalAmount: 68.65,
                notes: "Appartement au 2ème étage, code interphone: 1234",
            },
        });

        // Réservation confirmée
        await prisma.booking.create({
            data: {
                userId: client.id,
                serviceId: menageService.id,
                status: "CONFIRMED",
                requestedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
                requestedTime: "14:00",
                duration: 120, // 2 heures
                address: "15 rue de la République",
                city: "Montauban",
                postalCode: "82000",
                latitude: 44.0176,
                longitude: 1.3547,
                distance: 15.3,
                distanceFee: 2.65,
                baseAmount: 44, // 22€ * 2h
                optionsAmount: 5, // Fourniture produits
                totalAmount: 51.65,
                notes: "Nettoyage mensuel régulier",
                confirmedAt: new Date(),
            },
        });
    }

    console.log("✅ Demo bookings created");
    console.log("🎉 Database seeded successfully!");
    console.log("\n📋 Test accounts:");
    console.log("   Admin: admin@kiloutout.fr / admin123");
    console.log("   Client: client@test.fr / client123");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
