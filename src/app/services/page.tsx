"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Shirt,
  PawPrint,
  Trees,
  Briefcase,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";

const serviceIcons = {
  Concierge: Briefcase,
  Sparkles: Sparkles,
  Heart: Heart,
  Shirt: Shirt,
  PawPrint: PawPrint,
  Trees: Trees,
};

const serviceColors: Record<string, string> = {
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
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Chargement des services...</p>
        </div>
      </div>
    );
  }

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
          {services.map((service) => {
            const Icon = serviceIcons[service.icon as keyof typeof serviceIcons] || Briefcase;
            const colorClass = serviceColors[service.slug] || "bg-gray-100 text-gray-600";
            
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group"
              >
                <Card className="h-full card-hover transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 rounded-xl ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8" />
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
            );
          })}
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
