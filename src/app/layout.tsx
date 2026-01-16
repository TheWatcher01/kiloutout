import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header, Footer } from "@/components/layout";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://kiloutout.fr"),
  title: {
    default: "Kiloutout Services - Services à domicile",
    template: "%s | Kiloutout Services",
  },
  description:
    "Kiloutout Services - Votre partenaire de confiance pour tous vos services à domicile : conciergerie, ménage, aide à la personne, repassage, gardiennage d'animaux et tonte de pelouse.",
  keywords: [
    "services à domicile",
    "conciergerie",
    "ménage",
    "aide à la personne",
    "repassage",
    "gardiennage animaux",
    "tonte pelouse",
    "Escatalens",
    "82700",
  ],
  authors: [{ name: "Kiloutout Services" }],
  creator: "Kiloutout Services",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://kiloutout.fr",
    siteName: "Kiloutout Services",
    title: "Kiloutout Services - Services à domicile",
    description:
      "Votre partenaire de confiance pour tous vos services à domicile.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kiloutout Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiloutout Services - Services à domicile",
    description:
      "Votre partenaire de confiance pour tous vos services à domicile.",
    images: ["/images/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#E07A5F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
