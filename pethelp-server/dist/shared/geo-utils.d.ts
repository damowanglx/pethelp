export declare function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare function calculateTotalDistance(coords: Array<{
    lat: number;
    lng: number;
}>): number;
export declare function getBoundingBox(lat: number, lng: number, radiusKm: number): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
};
export declare function simplifyTrail(coords: Array<{
    lat: number;
    lng: number;
}>, tolerance: number): Array<{
    lat: number;
    lng: number;
}>;
