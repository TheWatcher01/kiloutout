"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Booking {
  id: string;
  status: string;
  requestedDate: string;
  requestedTime: string;
  address: string;
  city: string;
  totalAmount: number;
  service: {
    name: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "success";
      case "COMPLETED":
        return "info";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "CONFIRMED":
        return "Confirmée";
      case "COMPLETED":
        return "Terminée";
      case "CANCELLED":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {session.user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos réservations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">Réservations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-sm text-gray-500 mt-1">À confirmer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Terminées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-sm text-gray-500 mt-1">Services réalisés</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Mes réservations
          </h2>
          <Link href="/booking">
            <Button>Nouvelle réservation</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Vous n&apos;avez pas encore de réservation
                </p>
                <Link href="/booking">
                  <Button>Créer ma première réservation</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.service.name}
                        </h3>
                        <Badge variant={getStatusVariant(booking.status) as any}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          📅{" "}
                          {new Date(booking.requestedDate).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}{" "}
                          à {booking.requestedTime}
                        </p>
                        <p>
                          📍 {booking.address}, {booking.city}
                        </p>
                        <p className="font-semibold text-gray-900">
                          💰 {booking.totalAmount.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link href={`/booking/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
