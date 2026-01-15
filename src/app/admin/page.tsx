"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";

interface Booking {
  id: string;
  status: string;
  requestedDate: string;
  requestedTime: string;
  address: string;
  city: string;
  postalCode: string;
  totalAmount: number;
  baseAmount: number;
  distanceFee: number;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  service: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  options: Array<{
    serviceOption: {
      name: string;
    };
    price: number;
  }>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchBookings();
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, dateFilter, sortBy]);

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

  const applyFilters = () => {
    let filtered = [...bookings];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (dateFilter === "TODAY") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (b) => new Date(b.requestedDate).toDateString() === today
      );
    } else if (dateFilter === "WEEK") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (b) => new Date(b.requestedDate) >= weekAgo
      );
    } else if (dateFilter === "MONTH") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (b) => new Date(b.requestedDate) >= monthAgo
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime();
        case "date-desc":
          return new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime();
        case "amount-asc":
          return a.totalAmount - b.totalAmount;
        case "amount-desc":
          return b.totalAmount - a.totalAmount;
        case "created-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const handleConfirm = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (response.ok) {
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (response.ok) {
        setShowNotesModal(false);
        setAdminNotes("");
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setActionLoading(false);
    }
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

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    revenue: bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.totalAmount, 0),
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

  const groupBookingsByDate = () => {
    const grouped: { [key: string]: Booking[] } = {};
    filteredBookings.forEach((booking) => {
      const date = new Date(booking.requestedDate).toLocaleDateString("fr-FR");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });
    return grouped;
  };

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const groupedBookings = groupBookingsByDate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panneau d&apos;administration
          </h1>
          <p className="text-gray-600 mt-2">Gérez toutes les réservations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total réservations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">Toutes les réservations</p>
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
              <p className="text-sm text-gray-500 mt-1">À traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenu total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {stats.revenue.toFixed(2)} €
              </p>
              <p className="text-sm text-gray-500 mt-1">Services terminés</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-colors appearance-none cursor-pointer border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ALL">Tous</option>
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmées</option>
                  <option value="COMPLETED">Terminées</option>
                  <option value="CANCELLED">Annulées</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-colors appearance-none cursor-pointer border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ALL">Toutes</option>
                  <option value="TODAY">Aujourd&apos;hui</option>
                  <option value="WEEK">Cette semaine</option>
                  <option value="MONTH">Ce mois</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-colors appearance-none cursor-pointer border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="date-desc">Date (récent)</option>
                  <option value="date-asc">Date (ancien)</option>
                  <option value="amount-desc">Montant (élevé)</option>
                  <option value="amount-asc">Montant (faible)</option>
                  <option value="created-desc">Création (récent)</option>
                  <option value="created-asc">Création (ancien)</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vue
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    Liste
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "default" : "outline"}
                    onClick={() => setViewMode("calendar")}
                    className="flex-1"
                  >
                    Calendrier
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {viewMode === "list" ? (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Aucune réservation trouvée</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.service.name}
                            </h3>
                            <Badge variant={getStatusVariant(booking.status) as any}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Client: {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                            <p>📧 {booking.user.email}</p>
                            {booking.user.phone && <p>📱 {booking.user.phone}</p>}
                            <p>
                              📅{" "}
                              {new Date(booking.requestedDate).toLocaleDateString(
                                "fr-FR"
                              )}{" "}
                              à {booking.requestedTime}
                            </p>
                            <p>
                              📍 {booking.address}, {booking.postalCode} {booking.city}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {booking.totalAmount.toFixed(2)} €
                          </p>
                          <p className="text-xs text-gray-500">
                            Base: {booking.baseAmount.toFixed(2)} €
                          </p>
                          {booking.distanceFee > 0 && (
                            <p className="text-xs text-gray-500">
                              Déplacement: +{booking.distanceFee.toFixed(2)} €
                            </p>
                          )}
                        </div>
                      </div>

                      {booking.options.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Options:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {booking.options.map((opt, idx) => (
                              <Badge key={idx} variant="outline">
                                {opt.serviceOption.name} (+{opt.price.toFixed(2)} €)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {booking.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-gray-700">
                            Notes client:
                          </p>
                          <p className="text-sm text-gray-600">{booking.notes}</p>
                        </div>
                      )}

                      {booking.adminNotes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-gray-700">
                            Notes admin:
                          </p>
                          <p className="text-sm text-gray-600">{booking.adminNotes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleConfirm(booking.id)}
                              disabled={actionLoading}
                            >
                              ✓ Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              ✗ Rejeter
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setAdminNotes(booking.adminNotes || "");
                            setShowNotesModal(true);
                          }}
                          disabled={actionLoading}
                        >
                          📝 Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedBookings).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Aucune réservation trouvée</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedBookings).map(([date, dateBookings]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle>{date}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dateBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {booking.requestedTime}
                              </span>
                              <Badge variant={getStatusVariant(booking.status) as any}>
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">
                              {booking.service.name} - {booking.user.firstName}{" "}
                              {booking.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {booking.totalAmount.toFixed(2)} €
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectReason("");
            setSelectedBooking(null);
          }}
          title="Rejeter la réservation"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Indiquez la raison du rejet (facultatif)
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet..."
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedBooking(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                isLoading={actionLoading}
              >
                Rejeter
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showNotesModal && (
        <Modal
          isOpen={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setAdminNotes("");
            setSelectedBooking(null);
          }}
          title="Notes administrateur"
        >
          <div className="space-y-4">
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Ajoutez vos notes..."
              rows={6}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotesModal(false);
                  setAdminNotes("");
                  setSelectedBooking(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleSaveNotes} isLoading={actionLoading}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
