import nodemailer from "nodemailer";
import type { Booking, Service } from "@prisma/client";
import prisma from "./prisma";

interface BookingWithDetails extends Booking {
  service: Service;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  options: Array<{
    id: string;
    price: number;
    serviceOption: {
      id: string;
      name: string;
      description: string | null;
    };
  }>;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_PORT === "465",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const getBusinessInfo = async () => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
      select: {
        businessName: true,
        businessEmail: true,
        businessPhone: true,
        businessAddress: true,
        businessCity: true,
        businessPostalCode: true,
      },
    });
    return settings || {
      businessName: "Kiloutout Services",
      businessEmail: process.env.EMAIL_FROM || null,
      businessPhone: null,
      businessAddress: "1803 route de Toulouse",
      businessCity: "Escatalens",
      businessPostalCode: "82700",
    };
  } catch (error) {
    console.error("Error fetching business info:", error);
    return {
      businessName: "Kiloutout Services",
      businessEmail: process.env.EMAIL_FROM || null,
      businessPhone: null,
      businessAddress: "1803 route de Toulouse",
      businessCity: "Escatalens",
      businessPostalCode: "82700",
    };
  }
};

const getEmailLayout = (content: string, businessInfo: {
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string;
  businessCity: string;
  businessPostalCode: string;
}) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kiloutout Services</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${businessInfo.businessName}</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">Services de conciergerie professionnelle</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>${businessInfo.businessName}</strong>
              </p>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">
                ${businessInfo.businessAddress}, ${businessInfo.businessPostalCode} ${businessInfo.businessCity}
              </p>
              ${businessInfo.businessPhone ? `
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">
                Téléphone: ${businessInfo.businessPhone}
              </p>
              ` : ''}
              ${businessInfo.businessEmail ? `
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 13px;">
                Email: ${businessInfo.businessEmail}
              </p>
              ` : ''}
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ${businessInfo.businessName}. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getButtonStyle = () => `
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  margin: 20px 0;
`;

export async function sendWelcomeEmail(user: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const businessInfo = await getBusinessInfo();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const htmlContent = `
      <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">
        Bienvenue ${user.firstName} ${user.lastName} !
      </h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Nous sommes ravis de vous compter parmi nos clients. Votre compte a été créé avec succès.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Vous pouvez maintenant accéder à notre plateforme pour réserver nos services de conciergerie professionnelle.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dashboard" style="${getButtonStyle()}">
          Accéder à mon compte
        </a>
      </div>
      <div style="background-color: #f3f4f6; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;">
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>Prochaines étapes :</strong><br>
          • Complétez votre profil<br>
          • Découvrez nos services<br>
          • Effectuez votre première réservation
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
        Si vous avez des questions, n'hésitez pas à nous contacter.
      </p>
    `;

    const textContent = `
Bienvenue ${user.firstName} ${user.lastName} !

Nous sommes ravis de vous compter parmi nos clients. Votre compte a été créé avec succès.

Vous pouvez maintenant accéder à notre plateforme pour réserver nos services de conciergerie professionnelle.

Accédez à votre compte : ${appUrl}/dashboard

Prochaines étapes :
• Complétez votre profil
• Découvrez nos services
• Effectuez votre première réservation

Si vous avez des questions, n'hésitez pas à nous contacter.

---
${businessInfo.businessName}
${businessInfo.businessAddress}, ${businessInfo.businessPostalCode} ${businessInfo.businessCity}
${businessInfo.businessEmail ? `Email: ${businessInfo.businessEmail}` : ''}
${businessInfo.businessPhone ? `Téléphone: ${businessInfo.businessPhone}` : ''}
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Bienvenue chez ${businessInfo.businessName}`,
      text: textContent,
      html: getEmailLayout(htmlContent, businessInfo),
    });

    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

export async function sendBookingCreatedEmail(booking: BookingWithDetails) {
  try {
    const businessInfo = await getBusinessInfo();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const bookingDate = new Date(booking.requestedDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">
        Réservation créée avec succès
      </h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Bonjour ${booking.user.firstName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Votre demande de réservation a bien été enregistrée. Elle sera examinée par notre équipe dans les plus brefs délais.
      </p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Détails de la réservation</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.service.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Heure :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.requestedTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Durée :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.duration} heure(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Adresse :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.address}, ${booking.postalCode} ${booking.city}</td>
          </tr>
          ${booking.distance ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Distance :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.distance.toFixed(2)} km</td>
          </tr>
          ` : ''}
          ${booking.options.length > 0 ? `
          <tr>
            <td colspan="2" style="padding: 15px 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Options sélectionnées :</td>
          </tr>
          ${booking.options.map(opt => `
          <tr>
            <td style="padding: 4px 0 4px 15px; color: #6b7280; font-size: 14px;">• ${opt.serviceOption.name}</td>
            <td style="padding: 4px 0; color: #111827; font-size: 14px; text-align: right;">${opt.price.toFixed(2)} €</td>
          </tr>
          `).join('')}
          ` : ''}
          <tr>
            <td colspan="2" style="padding: 15px 0 0 0; border-top: 2px solid #e5e7eb;"></td>
          </tr>
          <tr>
            <td style="padding: 15px 0 0 0; color: #111827; font-size: 16px; font-weight: 700;">Montant total :</td>
            <td style="padding: 15px 0 0 0; color: #667eea; font-size: 18px; font-weight: 700; text-align: right;">${booking.totalAmount.toFixed(2)} €</td>
          </tr>
        </table>
        ${booking.notes ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Notes :</p>
          <p style="color: #111827; font-size: 14px; margin: 0;">${booking.notes}</p>
        </div>
        ` : ''}
      </div>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
        <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>⏳ En attente de confirmation</strong><br>
          Votre réservation sera confirmée une fois que notre équipe aura validé votre demande.
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dashboard/bookings/${booking.id}" style="${getButtonStyle()}">
          Voir ma réservation
        </a>
      </div>
    `;

    const textContent = `
Réservation créée avec succès

Bonjour ${booking.user.firstName},

Votre demande de réservation a bien été enregistrée. Elle sera examinée par notre équipe dans les plus brefs délais.

Détails de la réservation :
- Service : ${booking.service.name}
- Date : ${bookingDate}
- Heure : ${booking.requestedTime}
- Durée : ${booking.duration} heure(s)
- Adresse : ${booking.address}, ${booking.postalCode} ${booking.city}
${booking.distance ? `- Distance : ${booking.distance.toFixed(2)} km` : ''}
${booking.options.length > 0 ? `\nOptions sélectionnées :\n${booking.options.map(opt => `• ${opt.serviceOption.name} : ${opt.price.toFixed(2)} €`).join('\n')}` : ''}

Montant total : ${booking.totalAmount.toFixed(2)} €

${booking.notes ? `Notes : ${booking.notes}\n` : ''}
⏳ En attente de confirmation
Votre réservation sera confirmée une fois que notre équipe aura validé votre demande.

Voir ma réservation : ${appUrl}/dashboard/bookings/${booking.id}

---
${businessInfo.businessName}
${businessInfo.businessAddress}, ${businessInfo.businessPostalCode} ${businessInfo.businessCity}
${businessInfo.businessEmail ? `Email: ${businessInfo.businessEmail}` : ''}
${businessInfo.businessPhone ? `Téléphone: ${businessInfo.businessPhone}` : ''}
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.user.email,
      subject: `Réservation créée - ${booking.service.name}`,
      text: textContent,
      html: getEmailLayout(htmlContent, businessInfo),
    });

    console.log(`Booking created email sent to ${booking.user.email}`);
  } catch (error) {
    console.error("Error sending booking created email:", error);
  }
}

export async function sendBookingConfirmedEmail(booking: BookingWithDetails) {
  try {
    const businessInfo = await getBusinessInfo();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const bookingDate = new Date(booking.requestedDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">
        ✅ Réservation confirmée !
      </h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Bonjour ${booking.user.firstName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Excellente nouvelle ! Votre réservation a été confirmée. Nous serons ravis de vous servir.
      </p>
      <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #065f46; font-size: 18px; margin: 0 0 15px 0;">📅 Rendez-vous confirmé</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Service :</td>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">${booking.service.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Date :</td>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">${bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Heure :</td>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">${booking.requestedTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Durée :</td>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">${booking.duration} heure(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Adresse :</td>
            <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">${booking.address}, ${booking.postalCode} ${booking.city}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 15px 0 0 0; border-top: 2px solid #10b981;"></td>
          </tr>
          <tr>
            <td style="padding: 15px 0 0 0; color: #065f46; font-size: 16px; font-weight: 700;">Montant total :</td>
            <td style="padding: 15px 0 0 0; color: #10b981; font-size: 18px; font-weight: 700; text-align: right;">${booking.totalAmount.toFixed(2)} €</td>
          </tr>
        </table>
      </div>
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0;">
        <p style="color: #1e40af; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>📝 Important :</strong><br>
          • Merci d'être présent à l'heure indiquée<br>
          • Assurez-vous que l'accès au lieu soit facile<br>
          • Contactez-nous si vous devez modifier ou annuler
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dashboard/bookings/${booking.id}" style="${getButtonStyle()}">
          Voir ma réservation
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
        Nous avons hâte de vous servir !
      </p>
    `;

    const textContent = `
✅ Réservation confirmée !

Bonjour ${booking.user.firstName},

Excellente nouvelle ! Votre réservation a été confirmée. Nous serons ravis de vous servir.

📅 Rendez-vous confirmé :
- Service : ${booking.service.name}
- Date : ${bookingDate}
- Heure : ${booking.requestedTime}
- Durée : ${booking.duration} heure(s)
- Adresse : ${booking.address}, ${booking.postalCode} ${booking.city}

Montant total : ${booking.totalAmount.toFixed(2)} €

📝 Important :
• Merci d'être présent à l'heure indiquée
• Assurez-vous que l'accès au lieu soit facile
• Contactez-nous si vous devez modifier ou annuler

Voir ma réservation : ${appUrl}/dashboard/bookings/${booking.id}

Nous avons hâte de vous servir !

---
${businessInfo.businessName}
${businessInfo.businessAddress}, ${businessInfo.businessPostalCode} ${businessInfo.businessCity}
${businessInfo.businessEmail ? `Email: ${businessInfo.businessEmail}` : ''}
${businessInfo.businessPhone ? `Téléphone: ${businessInfo.businessPhone}` : ''}
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.user.email,
      subject: `✅ Réservation confirmée - ${booking.service.name}`,
      text: textContent,
      html: getEmailLayout(htmlContent, businessInfo),
    });

    console.log(`Booking confirmed email sent to ${booking.user.email}`);
  } catch (error) {
    console.error("Error sending booking confirmed email:", error);
  }
}

export async function sendBookingRejectedEmail(
  booking: BookingWithDetails,
  reason?: string
) {
  try {
    const businessInfo = await getBusinessInfo();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const bookingDate = new Date(booking.requestedDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">
        Réservation annulée
      </h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Bonjour ${booking.user.firstName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Nous sommes désolés de vous informer que votre réservation a dû être annulée.
      </p>
      ${reason ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 25px 0;">
        <p style="color: #7f1d1d; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>Raison de l'annulation :</strong><br>
          ${reason}
        </p>
      </div>
      ` : ''}
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Détails de la réservation annulée</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.service.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Heure :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.requestedTime}</td>
          </tr>
        </table>
      </div>
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0;">
        <p style="color: #1e40af; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>Vous souhaitez effectuer une nouvelle réservation ?</strong><br>
          N'hésitez pas à explorer nos services et à créer une nouvelle demande. Nous ferons de notre mieux pour vous satisfaire.
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/services" style="${getButtonStyle()}">
          Voir nos services
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
        Si vous avez des questions, n'hésitez pas à nous contacter directement.
      </p>
    `;

    const textContent = `
Réservation annulée

Bonjour ${booking.user.firstName},

Nous sommes désolés de vous informer que votre réservation a dû être annulée.

${reason ? `Raison de l'annulation :\n${reason}\n` : ''}
Détails de la réservation annulée :
- Service : ${booking.service.name}
- Date : ${bookingDate}
- Heure : ${booking.requestedTime}

Vous souhaitez effectuer une nouvelle réservation ?
N'hésitez pas à explorer nos services et à créer une nouvelle demande. Nous ferons de notre mieux pour vous satisfaire.

Voir nos services : ${appUrl}/services

Si vous avez des questions, n'hésitez pas à nous contacter directement.

---
${businessInfo.businessName}
${businessInfo.businessAddress}, ${businessInfo.businessPostalCode} ${businessInfo.businessCity}
${businessInfo.businessEmail ? `Email: ${businessInfo.businessEmail}` : ''}
${businessInfo.businessPhone ? `Téléphone: ${businessInfo.businessPhone}` : ''}
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.user.email,
      subject: `Réservation annulée - ${booking.service.name}`,
      text: textContent,
      html: getEmailLayout(htmlContent, businessInfo),
    });

    console.log(`Booking rejected email sent to ${booking.user.email}`);
  } catch (error) {
    console.error("Error sending booking rejected email:", error);
  }
}

export async function sendNewBookingNotificationToAdmin(
  booking: BookingWithDetails
) {
  try {
    const businessInfo = await getBusinessInfo();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const bookingDate = new Date(booking.requestedDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    if (adminUsers.length === 0) {
      console.log("No admin users found to send notification");
      return;
    }

    const adminEmails = adminUsers.map((admin) => admin.email);

    const htmlContent = `
      <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">
        🔔 Nouvelle réservation reçue
      </h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Une nouvelle demande de réservation a été créée et nécessite votre attention.
      </p>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
        <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>⚠️ Action requise</strong><br>
          Cette réservation est en attente de confirmation. Veuillez la valider ou la refuser dans les plus brefs délais.
        </p>
      </div>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Informations client</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Client :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.user.firstName} ${booking.user.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.user.email}</td>
          </tr>
          ${booking.user.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Téléphone :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.user.phone}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Détails de la réservation</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.service.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Heure :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.requestedTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Durée :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.duration} heure(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Adresse :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.address}, ${booking.postalCode} ${booking.city}</td>
          </tr>
          ${booking.distance ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Distance :</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${booking.distance.toFixed(2)} km</td>
          </tr>
          ` : ''}
          ${booking.options.length > 0 ? `
          <tr>
            <td colspan="2" style="padding: 15px 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Options sélectionnées :</td>
          </tr>
          ${booking.options.map(opt => `
          <tr>
            <td style="padding: 4px 0 4px 15px; color: #6b7280; font-size: 14px;">• ${opt.serviceOption.name}</td>
            <td style="padding: 4px 0; color: #111827; font-size: 14px; text-align: right;">${opt.price.toFixed(2)} €</td>
          </tr>
          `).join('')}
          ` : ''}
          <tr>
            <td colspan="2" style="padding: 15px 0 0 0; border-top: 2px solid #e5e7eb;"></td>
          </tr>
          <tr>
            <td style="padding: 15px 0 0 0; color: #111827; font-size: 16px; font-weight: 700;">Montant total :</td>
            <td style="padding: 15px 0 0 0; color: #667eea; font-size: 18px; font-weight: 700; text-align: right;">${booking.totalAmount.toFixed(2)} €</td>
          </tr>
        </table>
        ${booking.notes ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Notes du client :</p>
          <p style="color: #111827; font-size: 14px; margin: 0;">${booking.notes}</p>
        </div>
        ` : ''}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/admin/bookings/${booking.id}" style="${getButtonStyle()}">
          Gérer cette réservation
        </a>
      </div>
    `;

    const textContent = `
🔔 Nouvelle réservation reçue

Une nouvelle demande de réservation a été créée et nécessite votre attention.

⚠️ Action requise
Cette réservation est en attente de confirmation. Veuillez la valider ou la refuser dans les plus brefs délais.

Informations client :
- Client : ${booking.user.firstName} ${booking.user.lastName}
- Email : ${booking.user.email}
${booking.user.phone ? `- Téléphone : ${booking.user.phone}` : ''}

Détails de la réservation :
- Service : ${booking.service.name}
- Date : ${bookingDate}
- Heure : ${booking.requestedTime}
- Durée : ${booking.duration} heure(s)
- Adresse : ${booking.address}, ${booking.postalCode} ${booking.city}
${booking.distance ? `- Distance : ${booking.distance.toFixed(2)} km` : ''}
${booking.options.length > 0 ? `\nOptions sélectionnées :\n${booking.options.map(opt => `• ${opt.serviceOption.name} : ${opt.price.toFixed(2)} €`).join('\n')}` : ''}

Montant total : ${booking.totalAmount.toFixed(2)} €

${booking.notes ? `Notes du client :\n${booking.notes}\n` : ''}
Gérer cette réservation : ${appUrl}/admin/bookings/${booking.id}

---
${businessInfo.businessName}
${businessInfo.businessAddress}, ${businessInfo.businessPostalCode} ${businessInfo.businessCity}
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmails,
      subject: `🔔 Nouvelle réservation - ${booking.service.name}`,
      text: textContent,
      html: getEmailLayout(htmlContent, businessInfo),
    });

    console.log(`New booking notification sent to admins: ${adminEmails.join(", ")}`);
  } catch (error) {
    console.error("Error sending new booking notification to admin:", error);
  }
}
