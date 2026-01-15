import Link from "next/link";
import {
  Sparkles,
  Heart,
  Shirt,
  PawPrint,
  Trees,
  Briefcase,
  ArrowRight,
  Star,
  Clock,
  Shield,
  MapPin,
  Phone,
  CheckCircle,
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

const services = [
  {
    name: "Conciergerie",
    slug: "conciergerie",
    description: "Gestion de vos besoins quotidiens",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Femme de ménage",
    slug: "menage",
    description: "Nettoyage professionnel à domicile",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Aide à la personne",
    slug: "aide-personne",
    description: "Accompagnement et assistance",
    icon: Heart,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Repassage",
    slug: "repassage",
    description: "Linge soigneusement repassé",
    icon: Shirt,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Gardiennage d'animaux",
    slug: "gardiennage-animaux",
    description: "Soins et garde de vos compagnons",
    icon: PawPrint,
    color: "bg-amber-100 text-amber-600",
  },
  {
    name: "Tonte de pelouse",
    slug: "tonte-pelouse",
    description: "Entretien de votre jardin",
    icon: Trees,
    color: "bg-green-100 text-green-600",
  },
];

const features = [
  {
    icon: Clock,
    title: "Réservation simple",
    description: "Réservez en quelques clics, 24h/24",
  },
  {
    icon: Shield,
    title: "Service de confiance",
    description: "Professionnelle qualifiée et assurée",
  },
  {
    icon: Star,
    title: "Qualité garantie",
    description: "Satisfaction client notre priorité",
  },
  {
    icon: MapPin,
    title: "Proximité",
    description: "Interventions dans un rayon de 30km",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Star className="w-4 h-4" />
                Services à domicile de qualité
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Vos services à domicile,{" "}
                <span className="gradient-text">simplifiés</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl">
                Conciergerie, ménage, aide à la personne et bien plus encore.
                Réservez facilement et profitez d&apos;un service professionnel
                et personnalisé.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services">
                  <Button size="xl" className="w-full sm:w-auto">
                    Découvrir nos services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Créer un compte
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Devis gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Sans engagement</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl transform rotate-3" />
                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-8 h-full flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      {services.slice(0, 4).map((service) => (
                        <div
                          key={service.slug}
                          className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-3`}
                          >
                            <service.icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            {service.name}
                          </h3>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
            <p className="text-lg text-gray-600">
              Une gamme complète de services pour faciliter votre quotidien
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="h-full card-hover cursor-pointer group">
                  <CardContent className="p-6">
                    <div
                      className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <service.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600">{service.description}</p>
                    <div className="mt-4 flex items-center text-primary font-medium">
                      En savoir plus
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-lg text-gray-600">
              Des valeurs qui font la différence
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Créez votre compte gratuitement et réservez votre premier service
              en quelques minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="xl"
                  className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto"
                >
                  Créer un compte gratuit
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Zone d'intervention */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Zone d&apos;intervention
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Basée à Escatalens (82700), j&apos;interviens dans un rayon de
                30 kilomètres pour vous offrir des services de proximité et de
                qualité.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Montauban et ses environs
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Castelsarrasin, Moissac
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Fronton, Grisolles
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Et toutes les communes environnantes
                </li>
              </ul>
              <div className="mt-8 p-4 bg-primary/5 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">Frais de déplacement :</strong>{" "}
                  Gratuits jusqu&apos;à 10 km, puis 0,50€/km au-delà.
                </p>
              </div>
            </div>
            <div className="h-[400px] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
              {/* Placeholder pour la carte - sera remplacé par Leaflet */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Carte interactive</p>
                  <p className="text-sm">Zone d&apos;intervention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
