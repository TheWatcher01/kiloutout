"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface Settings {
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessPostalCode: string;
  businessLatitude: number;
  businessLongitude: number;
  businessPhone?: string;
  businessEmail?: string;
  distanceThreshold: number;
  pricePerKm: number;
  googleCalendarId?: string;
  defaultBookingBuffer: number;
  maxAdvanceBookingDays: number;
}

function AdminSettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    businessName: "Kiloutout Services",
    businessAddress: "1803 route de Toulouse",
    businessCity: "Escatalens",
    businessPostalCode: "82700",
    businessLatitude: 43.9833,
    businessLongitude: 1.2667,
    distanceThreshold: 10,
    pricePerKm: 0.5,
    defaultBookingBuffer: 60,
    maxAdvanceBookingDays: 60,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "google_connected") {
      setMessage({
        type: "success",
        text: "Google Calendar connecté avec succès!",
      });
      setTimeout(() => setMessage(null), 5000);
    } else if (error) {
      let errorText = "Une erreur est survenue";
      if (error === "google_auth_failed") errorText = "Échec de l'authentification Google";
      if (error === "callback_failed") errorText = "Erreur lors du callback Google";
      setMessage({ type: "error", text: errorText });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setIsGoogleConnected(data.isGoogleConnected);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Paramètres enregistrés avec succès!",
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: "error",
          text: "Erreur lors de l'enregistrement",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de l'enregistrement",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = "/api/admin/google/auth";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">
            Configurez les paramètres de votre application
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Connectez votre compte Google pour synchroniser automatiquement les
                    réservations avec votre calendrier.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut:</span>
                    {isGoogleConnected ? (
                      <Badge variant="success">✓ Connecté</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Non connecté</Badge>
                    )}
                  </div>
                </div>
                <Button onClick={handleConnectGoogle}>
                  {isGoogleConnected ? "Reconnecter" : "Connecter"} Google Calendar
                </Button>
              </div>
              {isGoogleConnected && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID du calendrier (optionnel)
                  </label>
                  <Input
                    type="text"
                    value={settings.googleCalendarId || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, googleCalendarId: e.target.value })
                    }
                    placeholder="primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour utiliser le calendrier principal
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Informations de l&apos;entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l&apos;entreprise
                  </label>
                  <Input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) =>
                      setSettings({ ...settings, businessName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <Input
                      type="text"
                      value={settings.businessAddress}
                      onChange={(e) =>
                        setSettings({ ...settings, businessAddress: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <Input
                      type="text"
                      value={settings.businessCity}
                      onChange={(e) =>
                        setSettings({ ...settings, businessCity: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <Input
                      type="text"
                      value={settings.businessPostalCode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          businessPostalCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={settings.businessPhone || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, businessPhone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={settings.businessEmail || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, businessEmail: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={settings.businessLatitude}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          businessLatitude: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={settings.businessLongitude}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          businessLongitude: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tarification et distance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seuil de distance gratuite (km)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.distanceThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          distanceThreshold: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Distance gratuite avant frais de déplacement
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix par km (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.pricePerKm}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricePerKm: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Au-delà du seuil gratuit
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Délai minimum entre réservations (min)
                    </label>
                    <Input
                      type="number"
                      value={settings.defaultBookingBuffer}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultBookingBuffer: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Réservation maximum à l&apos;avance (jours)
                    </label>
                    <Input
                      type="number"
                      value={settings.maxAdvanceBookingDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxAdvanceBookingDays: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button type="submit" size="lg" isLoading={saving}>
                Enregistrer les paramètres
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}
