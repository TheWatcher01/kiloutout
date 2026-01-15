"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import {
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  Loader2,
  Info,
} from "lucide-react";
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Checkbox,
} from "@/components/ui";


const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Veuillez sélectionner un service"),
  requestedDate: z.string().min(1, "Date requise"),
  requestedTime: z.string().min(1, "Heure requise"),
  duration: z.string().min(1, "Durée requise"),
  address: z.string().min(3, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(5, "Code postal requis"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Service {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  minDuration: number;
  maxDuration?: number;
  serviceOptions: ServiceOption[];
}

interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  price: number;
}

interface DistanceInfo {
  distance: number;
  distanceFee: number;
  threshold: number;
  pricePerKm: number;
}

const BUSINESS_LOCATION = {
  lat: 43.9833,
  lon: 1.2667,
  address: "1803 route de Toulouse, 82700 Escatalens",
};

export default function BookingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [clientLocation, setClientLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    Array<{ lat: string; lon: string; display_name: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const serviceId = watch("serviceId");
  const duration = watch("duration");
  const address = watch("address");
  const city = watch("city");
  const postalCode = watch("postalCode");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/booking");
    }
  }, [status, router]);

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

  useEffect(() => {
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId);
      setSelectedService(service || null);
      setValue("duration", service?.minDuration.toString() || "1");
      setSelectedOptions([]);
    }
  }, [serviceId, services, setValue]);

  useEffect(() => {
    const searchAddress = async () => {
      if (address && address.length > 3) {
        try {
          const query = `${address}${city ? `, ${city}` : ""}${postalCode ? `, ${postalCode}` : ""}, France`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
            {
              headers: {
                "User-Agent": "Kiloutout-PWA/1.0",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setAddressSuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        } catch (error) {
          console.error("Error fetching address suggestions:", error);
        }
      } else {
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(searchAddress, 500);
    return () => clearTimeout(timer);
  }, [address, city, postalCode]);

  useEffect(() => {
    const calculateDistance = async () => {
      if (address && city && postalCode && clientLocation) {
        try {
          const response = await fetch(
            "/api/bookings/calculate-distance",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientLat: clientLocation.lat,
                clientLon: clientLocation.lon,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            setDistanceInfo(data);
          }
        } catch (error) {
          console.error("Error calculating distance:", error);
        }
      }
    };

    calculateDistance();
  }, [clientLocation, address, city, postalCode]);

  const handleAddressSelect = async (suggestion: {
    lat: string;
    lon: string;
    display_name: string;
  }) => {
    const parts = suggestion.display_name.split(", ");
    const selectedAddress = parts[0];
    const selectedPostalCode =
      parts.find((p: string) => /^\d{5}$/.test(p)) || "";
    const selectedCity =
      parts.find((p: string) => !p.match(/^\d{5}$/) && p !== selectedAddress) ||
      "";

    setValue("address", selectedAddress);
    setValue("postalCode", selectedPostalCode);
    setValue("city", selectedCity);

    setClientLocation({
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });

    setShowSuggestions(false);
  };

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const calculateTotal = () => {
    if (!selectedService || !duration) return 0;

    const baseAmount = selectedService.basePrice * parseFloat(duration);
    const optionsAmount = selectedOptions.reduce((sum, optionId) => {
      const option = selectedService.serviceOptions.find(
        (o) => o.id === optionId
      );
      return sum + (option?.price || 0);
    }, 0);
    const distanceFee = distanceInfo?.distanceFee || 0;

    return baseAmount + optionsAmount + distanceFee;
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!clientLocation) {
      alert("Veuillez sélectionner une adresse valide");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          duration: parseInt(data.duration),
          selectedOptions,
        }),
      });

      if (response.ok) {
        router.push("/bookings?success=true");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la création de la réservation");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Erreur lors de la création de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nouvelle réservation
          </h1>
          <p className="text-lg text-gray-600">
            Réservez votre service en quelques clics
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Service"
                  placeholder="Sélectionnez un service"
                  options={services.map((s) => ({
                    value: s.id,
                    label: `${s.name} - ${s.basePrice}€/${s.unit}`,
                  }))}
                  error={errors.serviceId?.message}
                  {...register("serviceId")}
                />

                {selectedService && (
                  <div className="space-y-4">
                    <Input
                      type="number"
                      label={`Durée (${selectedService.unit})`}
                      min={selectedService.minDuration}
                      max={selectedService.maxDuration || undefined}
                      error={errors.duration?.message}
                      {...register("duration")}
                    />

                    {selectedService.serviceOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Options supplémentaires
                        </label>
                        <div className="space-y-2">
                          {selectedService.serviceOptions.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
                            >
                              <Checkbox
                                checked={selectedOptions.includes(option.id)}
                                onCheckedChange={() =>
                                  handleOptionToggle(option.id)
                                }
                              />
                              <div className="flex-1">
                                <div className="font-medium">{option.name}</div>
                                {option.description && (
                                  <div className="text-sm text-gray-600">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              <div className="font-semibold text-primary">
                                +{option.price}€
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date et heure
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Date souhaitée"
                  min={new Date().toISOString().split("T")[0]}
                  error={errors.requestedDate?.message}
                  {...register("requestedDate")}
                />
                <Input
                  type="time"
                  label="Heure souhaitée"
                  error={errors.requestedTime?.message}
                  {...register("requestedTime")}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse d&apos;intervention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    label="Adresse"
                    placeholder="Numéro et nom de rue"
                    error={errors.address?.message}
                    {...register("address")}
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Code postal"
                    placeholder="82700"
                    error={errors.postalCode?.message}
                    {...register("postalCode")}
                  />
                  <Input
                    label="Ville"
                    placeholder="Escatalens"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                </div>

                {clientLocation && (
                  <MapComponent
                    businessLocation={BUSINESS_LOCATION}
                    clientLocation={clientLocation}
                  />
                )}

                {distanceInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-blue-900">
                          Distance : {distanceInfo.distance} km
                        </p>
                        {distanceInfo.distanceFee > 0 && (
                          <p className="text-blue-700">
                            Au-delà de {distanceInfo.threshold} km, des frais de
                            déplacement de {distanceInfo.pricePerKm}€/km
                            s&apos;appliquent (
                            {(
                              distanceInfo.distance - distanceInfo.threshold
                            ).toFixed(2)}{" "}
                            km × {distanceInfo.pricePerKm}€ ={" "}
                            {distanceInfo.distanceFee.toFixed(2)}€)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informations complémentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Notes / Commentaires"
                  placeholder="Précisions sur votre demande, accès au domicile, etc."
                  rows={4}
                  {...register("notes")}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedService && duration && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Service</span>
                          <span className="font-medium">
                            {selectedService.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {selectedService.basePrice}€ × {duration}{" "}
                            {selectedService.unit}
                          </span>
                          <span className="font-medium">
                            {(
                              selectedService.basePrice * parseFloat(duration)
                            ).toFixed(2)}
                            €
                          </span>
                        </div>

                        {selectedOptions.length > 0 && (
                          <>
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Options
                              </p>
                              {selectedOptions.map((optionId) => {
                                const option = selectedService.serviceOptions.find(
                                  (o) => o.id === optionId
                                );
                                return option ? (
                                  <div
                                    key={option.id}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {option.name}
                                    </span>
                                    <span className="font-medium">
                                      {option.price.toFixed(2)}€
                                    </span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </>
                        )}

                        {distanceInfo && distanceInfo.distanceFee > 0 && (
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Frais de déplacement
                              </span>
                              <span className="font-medium">
                                {distanceInfo.distanceFee.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">
                              {calculateTotal().toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isLoading={submitting}
                        disabled={!clientLocation}
                      >
                        Confirmer la réservation
                      </Button>

                      {!clientLocation && (
                        <p className="text-xs text-center text-amber-600">
                          Veuillez sélectionner une adresse dans les suggestions
                        </p>
                      )}
                    </>
                  )}

                  {!selectedService && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Sélectionnez un service pour voir le récapitulatif
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const Briefcase = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
