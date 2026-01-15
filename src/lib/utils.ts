import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Formatage de prix
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
    }).format(price);
}

// Formatage de date
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

// Formatage de date courte
export function formatShortDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}

// Formatage d'heure
export function formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    return `${hours}h${minutes}`;
}

// Formatage de durée
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins.toString().padStart(2, "0")}`;
}

// Formatage de distance
export function formatDistance(km: number): string {
    return `${km.toFixed(1)} km`;
}

// Labels des statuts de réservation
export const bookingStatusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
    REJECTED: "Refusée",
};

// Couleurs des statuts
export const bookingStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-green-100 text-green-800 border-green-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
};

// Jours de la semaine
export const weekDays = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
];

// Génération des créneaux horaires
export function generateTimeSlots(
    startHour: number = 8,
    endHour: number = 18,
    intervalMinutes: number = 30
): string[] {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            slots.push(
                `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
            );
        }
    }
    return slots;
}

// Génération des options de durée
export function generateDurationOptions(
    minHours: number = 1,
    maxHours: number = 8
): { value: number; label: string }[] {
    const options: { value: number; label: string }[] = [];
    for (let hours = minHours; hours <= maxHours; hours++) {
        options.push({
            value: hours * 60,
            label: `${hours} heure${hours > 1 ? "s" : ""}`,
        });
        if (hours < maxHours) {
            options.push({
                value: hours * 60 + 30,
                label: `${hours}h30`,
            });
        }
    }
    return options;
}

// Calcul de la distance en km (formule de Haversine)
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Calcul des frais de déplacement
export function calculateDistanceFee(
    distance: number,
    threshold: number,
    pricePerKm: number
): number {
    if (distance <= threshold) return 0;
    return (distance - threshold) * pricePerKm;
}

// Validation d'email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validation de code postal français
export function isValidPostalCode(postalCode: string): boolean {
    const postalCodeRegex = /^[0-9]{5}$/;
    return postalCodeRegex.test(postalCode);
}

// Validation de numéro de téléphone français
export function isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(0|\+33)[1-9][0-9]{8}$/;
    return phoneRegex.test(cleanPhone);
}

// Génération d'un slug
export function slugify(text: string): string {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
}

// Troncature de texte
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
}

// Capitalisation de la première lettre
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Obtention des initiales
export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Date du prochain jour ouvrable
export function getNextBusinessDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + 1);
    while (result.getDay() === 0 || result.getDay() === 6) {
        result.setDate(result.getDate() + 1);
    }
    return result;
}

// Vérification si une date est dans le futur
export function isFutureDate(date: Date | string): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
}

// Vérification si une date est un jour ouvrable
export function isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6;
}
