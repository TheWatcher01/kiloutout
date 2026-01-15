export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Kiloutout-PWA/1.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

export function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistanceFee(
  distance: number,
  threshold: number,
  pricePerKm: number
): number {
  if (distance <= threshold) {
    return 0;
  }

  const billableDistance = distance - threshold;
  return Math.round(billableDistance * pricePerKm * 100) / 100;
}
