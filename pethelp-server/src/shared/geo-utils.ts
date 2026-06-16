/**
 * Haversine distance between two lat/lng points in meters.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance from array of coordinates.
 */
export function calculateTotalDistance(
  coords: Array<{ lat: number; lng: number }>,
): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(
      coords[i - 1].lat, coords[i - 1].lng,
      coords[i].lat, coords[i].lng,
    );
  }
  return Math.round(total);
}

/**
 * Get bounding box for nearby query.
 */
export function getBoundingBox(
  lat: number, lng: number, radiusKm: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Simplify trail using Ramer-Douglas-Peucker for efficient rendering.
 */
export function simplifyTrail(
  coords: Array<{ lat: number; lng: number }>,
  tolerance: number,
): Array<{ lat: number; lng: number }> {
  if (coords.length <= 2) return coords;

  let maxDist = 0;
  let maxIdx = 0;
  const first = coords[0];
  const last = coords[coords.length - 1];

  for (let i = 1; i < coords.length - 1; i++) {
    const dist = perpendicularDistance(coords[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyTrail(coords.slice(0, maxIdx + 1), tolerance);
    const right = simplifyTrail(coords.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }

  return [first, last];
}

function perpendicularDistance(
  point: { lat: number; lng: number },
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
): number {
  const d = haversineDistance(start.lat, start.lng, end.lat, end.lng);
  if (d === 0) return haversineDistance(point.lat, point.lng, start.lat, start.lng);

  const area = Math.abs(
    (end.lat - start.lat) * (start.lng - point.lng) -
    (start.lat - point.lat) * (end.lng - start.lng),
  );
  return (area / d) * 111320;
}
