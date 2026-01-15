import Link from "next/link";
import {
  Sparkles,
  Heart,
  Shirt,
  PawPrint,
  Trees,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";

const services = [
  {
    name: "Conciergerie",
    slug: "conciergerie",
    description: "Gestion de vos besoins quotidiens et services personnalisés",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Femme de ménage",
    slug: "menage",
    description: "Nettoyage professionnel et entretien de votre domicile",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Aide à la personne",
    slug: "aide-personne",
    description: "Accompagnement et assistance pour les personnes dépendantes",
    icon: Heart,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Repassage",
    slug: "repassage",
    description: "Linge soigneusement repassé et plié selon vos préférences",
    icon: Shirt,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Gardiennage d'animaux",
    slug: "gardiennage-animaux",
    description: "Soins et garde de vos compagnons en votre absence",
    icon: PawPrint,
    color: "bg-amber-100 text-amber-600",
  },
  {
    name: "Tonte de pelouse",
    slug: "tonte-pelouse",
    description: "Entretien professionnel de votre jardin et espaces verts",
    icon: Trees,
    color: "bg-green-100 text-green-600",
  },
];

export const metadata = {
  title: "Nos Services",
  description: "Découvrez notre gamme complète de services à domicile",
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nos services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une gamme complète de services professionnels pour faciliter votre
            quotidien et vous faire gagner du temps
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group"
            >
              <Card className="h-full card-hover transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                    En savoir plus
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Besoin d&apos;aide pour choisir ?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Contactez-nous pour discuter de vos besoins et trouver la solution
            qui vous convient le mieux
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Nous contacter
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
