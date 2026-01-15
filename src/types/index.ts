// Types partagés pour l'application Kiloutout

// Rôles utilisateur
export type UserRole = "CLIENT" | "ADMIN";

// Statuts de réservation
export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED";

// Types de notification
export type NotificationType =
    | "BOOKING_CREATED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_REJECTED"
    | "BOOKING_CANCELLED"
    | "BOOKING_COMPLETED"
    | "BOOKING_REMINDER"
    | "SYSTEM";

// Type modificateur de prix
export type PriceModifierType = "MULTIPLIER" | "FIXED";

// Interface utilisateur
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
}

// Interface service
export interface Service {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    basePrice: number;
    unit: string;
    minDuration: number;
    maxDuration?: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    priceOptions?: PriceOption[];
    serviceOptions?: ServiceOption[];
}

// Interface option de prix
export interface PriceOption {
    id: string;
    serviceId: string;
    name: string;
    description?: string | null;
    priceModifier: number;
    modifierType: PriceModifierType;
    isActive: boolean;
}

// Interface option de service
export interface ServiceOption {
    id: string;
    serviceId: string;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
}

// Interface réservation
export interface Booking {
    id: string;
    userId: string;
    serviceId: string;
    status: BookingStatus;
    requestedDate: Date;
    requestedTime: string;
    duration: number;
    address: string;
    city: string;
    postalCode: string;
    latitude?: number | null;
    longitude?: number | null;
    distance?: number | null;
    distanceFee: number;
    baseAmount: number;
    optionsAmount: number;
    totalAmount: number;
    notes?: string | null;
    adminNotes?: string | null;
    googleEventId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt?: Date | null;
    completedAt?: Date | null;
    cancelledAt?: Date | null;
    user?: User;
    service?: Service;
    options?: BookingOption[];
}

// Interface option de réservation
export interface BookingOption {
    id: string;
    bookingId: string;
    serviceOptionId: string;
    price: number;
    serviceOption?: ServiceOption;
}

// Interface notification
export interface Notification {
    id: string;
    userId: string;
    bookingId?: string | null;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

// Interface paramètres
export interface Settings {
    id: string;
    businessName: string;
    businessAddress: string;
    businessCity: string;
    businessPostalCode: string;
    businessLatitude: number;
    businessLongitude: number;
    businessPhone?: string | null;
    businessEmail?: string | null;
    distanceThreshold: number;
    pricePerKm: number;
    googleCalendarId?: string | null;
    defaultBookingBuffer: number;
    maxAdvanceBookingDays: number;
    updatedAt: Date;
}

// Interface disponibilité
export interface Availability {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

// Interface date indisponible
export interface UnavailableDate {
    id: string;
    date: Date;
    reason?: string | null;
    createdAt: Date;
}

// Types pour les formulaires
export interface BookingFormData {
    serviceId: string;
    requestedDate: string;
    requestedTime: string;
    duration: number;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
    selectedOptions: string[];
    selectedPriceOption?: string;
}

export interface QuoteCalculation {
    basePrice: number;
    duration: number;
    baseAmount: number;
    priceModifier: number;
    optionsAmount: number;
    distance: number;
    distanceFee: number;
    totalAmount: number;
    breakdown: QuoteBreakdownItem[];
}

export interface QuoteBreakdownItem {
    label: string;
    amount: number;
    type: "base" | "option" | "modifier" | "fee";
}

// Types pour les coordonnées géographiques
export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface GeocodingResult {
    address: string;
    city: string;
    postalCode: string;
    coordinates: Coordinates;
}

export interface DistanceResult {
    distance: number; // en km
    duration: number; // en minutes
    fee: number;
    isFreeZone: boolean;
}

// Types pour les statistiques admin
export interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    popularServices: ServiceStats[];
}

export interface ServiceStats {
    serviceId: string;
    serviceName: string;
    bookingCount: number;
    revenue: number;
}

// Types pour les filtres
export interface BookingFilters {
    status?: BookingStatus | "ALL";
    serviceId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

// Types pour la session utilisateur
export interface SessionUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    image?: string | null;
}
