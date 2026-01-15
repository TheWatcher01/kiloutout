"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Heart,
  Shirt,
  PawPrint,
  Trees,
  Briefcase,
  ArrowRight,
  Clock,
  Euro,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Checkbox,
} from "@/components/ui";

const serviceIcons = {
  Concierge: Briefcase,
  Sparkles: Sparkles,
  Heart: Heart,
  Shirt: Shirt,
  PawPrint: PawPrint,
  Trees: Trees,
};

const serviceColors = {
  conciergerie: "bg-purple-100 text-purple-600",
  menage: "bg-blue-100 text-blue-600",
  "aide-personne": "bg-pink-100 text-pink-600",
  repassage: "bg-orange-100 text-orange-600",
  "gardiennage-animaux": "bg-amber-100 text-amber-600",
  "tonte-pelouse": "bg-green-100 text-green-600",
};

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  basePrice: number;
  unit: string;
  minDuration: number;
  maxDuration: number | null;
  priceOptions: Array<{
    id: string;
    name: string;
    description: string | null;
    priceModifier: number;
    modifierType: string;
  }>;
  serviceOptions: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
  }>;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [duration, setDuration] = useState(2);
  const [selectedPriceOption, setSelectedPriceOption] = useState<string | null>(
    null
  );
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<
    string[]
  >([]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/services/by-slug/${slug}`);
        if (!response.ok) {
          throw new Error("Erreur lors du chargement du service");
        }

        const foundService = await response.json();

        if (foundService.error) {
          setError(foundService.error);
          return;
        }

        setService(foundService);
        setDuration(foundService.minDuration);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  const calculatePrice = () => {
    if (!service) return 0;

    let total = service.basePrice * duration;

    if (selectedPriceOption) {
      const option = service.priceOptions.find(
        (o) => o.id === selectedPriceOption
      );
      if (option && option.modifierType === "MULTIPLIER") {
        total *= option.priceModifier;
      }
    }

    selectedServiceOptions.forEach((optionId) => {
      const option = service.serviceOptions.find((o) => o.id === optionId);
      if (option) {
        total += option.price;
      }
    });

    return total;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Chargement du service...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Service non trouvé"}
            </h2>
            <p className="text-gray-600 mb-6">
              Le service que vous recherchez n&apos;existe pas ou n&apos;est
              plus disponible.
            </p>
            <Link href="/services">
              <Button>Retour aux services</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon =
    serviceIcons[service.icon as keyof typeof serviceIcons] || Briefcase;
  const colorClass =
    serviceColors[service.slug as keyof typeof serviceColors] ||
    "bg-gray-100 text-gray-600";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/services" className="hover:text-primary">
            Services
          </Link>
          <span>/</span>
          <span className="text-gray-900">{service.name}</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div
            className={`w-20 h-20 rounded-2xl ${colorClass} flex items-center justify-center mb-6`}
          >
            <Icon className="w-10 h-10" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {service.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {service.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Service Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails du service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Tarif de base</p>
                    <p className="text-gray-600">
                      {service.basePrice}€ / {service.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Durée</p>
                    <p className="text-gray-600">
                      {service.minDuration}
                      {service.maxDuration
                        ? ` à ${service.maxDuration}`
                        : "+"}{" "}
                      heure(s) minimum
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations complémentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Service professionnel et de qualité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Prestataire qualifiée et assurée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Frais de déplacement : gratuits jusqu&apos;à 10 km, puis
                      0,50€/km
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Devis gratuit et sans engagement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing Calculator */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Calculateur de prix</CardTitle>
                <CardDescription>
                  Estimez le coût de votre prestation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Durée ({service.unit})
                  </label>
                  <input
                    type="range"
                    min={service.minDuration}
                    max={service.maxDuration || 8}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>
                      {duration} {service.unit}
                      {duration > 1 ? "s" : ""}
                    </span>
                    <span>
                      {service.basePrice * duration}€
                    </span>
                  </div>
                </div>

                {/* Price Options */}
                {service.priceOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Options de tarification
                    </label>
                    <div className="space-y-2">
                      {service.priceOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name="priceOption"
                            value={option.id}
                            checked={selectedPriceOption === option.id}
                            onChange={(e) =>
                              setSelectedPriceOption(e.target.value)
                            }
                            className="text-primary"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {option.name}
                            </p>
                            {option.description && (
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Options */}
                {service.serviceOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Options supplémentaires
                    </label>
                    <div className="space-y-2">
                      {service.serviceOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={selectedServiceOptions.includes(option.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServiceOptions([
                                  ...selectedServiceOptions,
                                  option.id,
                                ]);
                              } else {
                                setSelectedServiceOptions(
                                  selectedServiceOptions.filter(
                                    (id) => id !== option.id
                                  )
                                );
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {option.name}
                            </p>
                            {option.description && (
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">+{option.price}€</Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Price */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Prix estimé
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      {calculatePrice().toFixed(2)}€
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Prix indicatif hors frais de déplacement
                  </p>
                  <Link href="/booking" className="block">
                    <Button size="lg" className="w-full">
                      Réserver ce service
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
